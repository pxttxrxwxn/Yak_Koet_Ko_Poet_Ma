import type { CreateQuizAttemptInput, QuizAttempt, QuizResult } from '../domain/entities/quiz-attempt'
import type { CreateQuizInput, Quiz, UpdateQuizInput } from '../domain/entities/quiz'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { QuizAttemptRepository } from '../domain/repositories/quiz-attempt-repository'
import type { QuizRepository } from '../domain/repositories/quiz-repository'

export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly attemptRepository: QuizAttemptRepository,
  ) {}

  async listQuizzes(): Promise<Quiz[]> {
    return this.quizRepository.findAll()
  }

  async getQuiz(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(id)
    if (!quiz) throw new NotFoundError('Quiz')
    return quiz
  }

  async createQuiz(input: CreateQuizInput): Promise<Quiz> {
    if (!input.title?.trim()) throw new ValidationError('title is required')

    // Validate questions JSON
    try {
      const parsed = JSON.parse(input.questions)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new ValidationError('questions must be a non-empty array')
      }
    } catch (e) {
      if (e instanceof ValidationError) throw e
      throw new ValidationError('questions must be valid JSON array')
    }

    return this.quizRepository.create({
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      questions: input.questions,
      source: input.source?.trim() ?? '',
      createdBy: input.createdBy ?? 'unknown',
    })
  }

  async updateQuiz(id: string, input: UpdateQuizInput): Promise<Quiz> {
    const updated = await this.quizRepository.update(id, input)
    if (!updated) throw new NotFoundError('Quiz')
    return updated
  }

  async deleteQuiz(id: string): Promise<void> {
    const deleted = await this.quizRepository.delete(id)
    if (!deleted) throw new NotFoundError('Quiz')
  }

  async listAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.findByUserId(userId)
  }

  async listAttemptsByQuiz(quizId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.findByQuizId(quizId)
  }

  async submitAttempt(input: CreateQuizAttemptInput): Promise<QuizResult> {
    const quiz = await this.quizRepository.findById(input.quizId)
    if (!quiz) throw new NotFoundError('Quiz')

    const attempt = await this.attemptRepository.create({
      quizId: input.quizId,
      userId: input.userId ?? 'anonymous',
      answers: input.answers,
      score: input.score,
      total: input.total,
    })

    return {
      attempt,
      quiz: {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
      },
    }
  }
}
