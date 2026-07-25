import type { Context } from 'hono'
import type { CreateQuizInput, UpdateQuizInput } from '../domain/entities/quiz'
import type { CreateQuizAttemptInput } from '../domain/entities/quiz-attempt'
import { ValidationError } from '../domain/errors'
import type { QuizService } from '../services/quiz-service'

export class QuizHandler {
  constructor(private readonly quizService: QuizService) {}

  list = async (c: Context) => {
    const quizzes = await this.quizService.listQuizzes()
    return c.json({ data: quizzes })
  }

  get = async (c: Context) => {
    const quiz = await this.quizService.getQuiz(this.param(c, 'id'))
    return c.json({ data: quiz })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateQuizInput>(c)
    const quiz = await this.quizService.createQuiz(body)
    return c.json({ data: quiz }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateQuizInput>(c)
    const quiz = await this.quizService.updateQuiz(this.param(c, 'id'), body)
    return c.json({ data: quiz })
  }

  delete = async (c: Context) => {
    await this.quizService.deleteQuiz(this.param(c, 'id'))
    return c.body(null, 204)
  }

  listAttemptsByUser = async (c: Context) => {
    const userId = this.param(c, 'userId')
    const attempts = await this.quizService.listAttemptsByUser(userId)
    return c.json({ data: attempts })
  }

  listAttemptsByQuiz = async (c: Context) => {
    const quizId = this.param(c, 'quizId')
    const attempts = await this.quizService.listAttemptsByQuiz(quizId)
    return c.json({ data: attempts })
  }

  submitAttempt = async (c: Context) => {
    const body = await this.parseJson<CreateQuizAttemptInput>(c)
    const result = await this.quizService.submitAttempt(body)
    return c.json({ data: result }, 201)
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
