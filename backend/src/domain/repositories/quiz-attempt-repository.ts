import type { CreateQuizAttemptInput, QuizAttempt } from '../entities/quiz-attempt'

export interface QuizAttemptRepository {
  findByQuizId(quizId: string): Promise<QuizAttempt[]>
  findByUserId(userId: string): Promise<QuizAttempt[]>
  findById(id: string): Promise<QuizAttempt | null>
  create(input: CreateQuizAttemptInput): Promise<QuizAttempt>
}
