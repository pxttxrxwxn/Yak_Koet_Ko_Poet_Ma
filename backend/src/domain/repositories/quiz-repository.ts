import type { CreateQuizInput, Quiz, UpdateQuizInput } from '../entities/quiz'

export interface QuizRepository {
  findAll(): Promise<Quiz[]>
  findById(id: string): Promise<Quiz | null>
  create(input: CreateQuizInput): Promise<Quiz>
  update(id: string, input: UpdateQuizInput): Promise<Quiz | null>
  delete(id: string): Promise<boolean>
}
