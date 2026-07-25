import type { CreateQuizInput, Quiz, UpdateQuizInput } from '../../domain/entities/quiz'
import type { QuizRepository } from '../../domain/repositories/quiz-repository'

interface QuizRow {
  id: string
  title: string
  description: string
  questions: string
  source: string
  created_by: string
  created_at: string
}

function toQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    questions: row.questions,
    source: row.source,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

export class D1QuizRepository implements QuizRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Quiz[]> {
    const { results } = await this.db
      .prepare('SELECT id, title, description, questions, source, created_by, created_at FROM quizzes ORDER BY created_at DESC')
      .all<QuizRow>()
    return results.map(toQuiz)
  }

  async findById(id: string): Promise<Quiz | null> {
    const row = await this.db
      .prepare('SELECT id, title, description, questions, source, created_by, created_at FROM quizzes WHERE id = ?')
      .bind(id)
      .first<QuizRow>()
    return row ? toQuiz(row) : null
  }

  async create(input: CreateQuizInput): Promise<Quiz> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO quizzes (id, title, description, questions, source, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.title, input.description, input.questions, input.source, input.createdBy, createdAt)
      .run()
    return { id, title: input.title, description: input.description, questions: input.questions, source: input.source, createdBy: input.createdBy, createdAt }
  }

  async update(id: string, input: UpdateQuizInput): Promise<Quiz | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const title = input.title ?? existing.title
    const description = input.description ?? existing.description
    const questions = input.questions ?? existing.questions
    const source = input.source ?? existing.source
    await this.db
      .prepare('UPDATE quizzes SET title = ?, description = ?, questions = ?, source = ? WHERE id = ?')
      .bind(title, description, questions, source, id)
      .run()
    return { ...existing, title, description, questions, source }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM quizzes WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
