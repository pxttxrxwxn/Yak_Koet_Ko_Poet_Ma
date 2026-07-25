import type { CreateQuizAttemptInput, QuizAttempt } from '../../domain/entities/quiz-attempt'
import type { QuizAttemptRepository } from '../../domain/repositories/quiz-attempt-repository'

interface AttemptRow {
  id: string
  quiz_id: string
  user_id: string
  answers: string
  score: number
  total: number
  completed_at: string | null
  created_at: string
}

function toAttempt(row: AttemptRow): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    userId: row.user_id,
    answers: row.answers,
    score: row.score,
    total: row.total,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}

export class D1QuizAttemptRepository implements QuizAttemptRepository {
  constructor(private readonly db: D1Database) {}

  async findByQuizId(quizId: string): Promise<QuizAttempt[]> {
    const { results } = await this.db
      .prepare('SELECT id, quiz_id, user_id, answers, score, total, completed_at, created_at FROM quiz_attempts WHERE quiz_id = ? ORDER BY created_at DESC')
      .bind(quizId)
      .all<AttemptRow>()
    return results.map(toAttempt)
  }

  async findByUserId(userId: string): Promise<QuizAttempt[]> {
    const { results } = await this.db
      .prepare('SELECT id, quiz_id, user_id, answers, score, total, completed_at, created_at FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<AttemptRow>()
    return results.map(toAttempt)
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    const row = await this.db
      .prepare('SELECT id, quiz_id, user_id, answers, score, total, completed_at, created_at FROM quiz_attempts WHERE id = ?')
      .bind(id)
      .first<AttemptRow>()
    return row ? toAttempt(row) : null
  }

  async create(input: CreateQuizAttemptInput): Promise<QuizAttempt> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO quiz_attempts (id, quiz_id, user_id, answers, score, total, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.quizId, input.userId, input.answers, input.score, input.total, createdAt, createdAt)
      .run()
    return { id, quizId: input.quizId, userId: input.userId, answers: input.answers, score: input.score, total: input.total, completedAt: createdAt, createdAt }
  }
}
