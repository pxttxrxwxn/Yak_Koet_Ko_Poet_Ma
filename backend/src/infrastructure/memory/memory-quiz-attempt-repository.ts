import type { CreateQuizAttemptInput, QuizAttempt } from '../../domain/entities/quiz-attempt'
import type { QuizAttemptRepository } from '../../domain/repositories/quiz-attempt-repository'

export class MemoryQuizAttemptRepository implements QuizAttemptRepository {
  private readonly attempts = new Map<string, QuizAttempt>()

  async findByQuizId(quizId: string): Promise<QuizAttempt[]> {
    return [...this.attempts.values()].filter(a => a.quizId === quizId)
  }

  async findByUserId(userId: string): Promise<QuizAttempt[]> {
    return [...this.attempts.values()].filter(a => a.userId === userId)
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    return this.attempts.get(id) ?? null
  }

  async create(input: CreateQuizAttemptInput): Promise<QuizAttempt> {
    const now = new Date().toISOString()
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      quizId: input.quizId,
      userId: input.userId,
      answers: input.answers,
      score: input.score,
      total: input.total,
      completedAt: now,
      createdAt: now,
    }
    this.attempts.set(attempt.id, attempt)
    return attempt
  }
}
