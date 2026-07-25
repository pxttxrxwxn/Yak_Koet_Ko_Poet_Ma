import type { CreateQuizInput, Quiz, UpdateQuizInput } from '../../domain/entities/quiz'
import type { QuizRepository } from '../../domain/repositories/quiz-repository'

export class MemoryQuizRepository implements QuizRepository {
  private readonly quizzes = new Map<string, Quiz>()

  async findAll(): Promise<Quiz[]> {
    return [...this.quizzes.values()]
  }

  async findById(id: string): Promise<Quiz | null> {
    return this.quizzes.get(id) ?? null
  }

  async create(input: CreateQuizInput): Promise<Quiz> {
    const quiz: Quiz = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      questions: input.questions,
      source: input.source,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    }
    this.quizzes.set(quiz.id, quiz)
    return quiz
  }

  async update(id: string, input: UpdateQuizInput): Promise<Quiz | null> {
    const existing = this.quizzes.get(id)
    if (!existing) return null
    const updated: Quiz = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      questions: input.questions ?? existing.questions,
      source: input.source ?? existing.source,
    }
    this.quizzes.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.quizzes.delete(id)
  }
}
