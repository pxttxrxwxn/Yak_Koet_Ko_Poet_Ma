import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { QuizAttemptRepository } from '../domain/repositories/quiz-attempt-repository'
import type { QuizRepository } from '../domain/repositories/quiz-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import { QuizHandler } from '../handlers/quiz-handler'
import { UserHandler } from '../handlers/user-handler'
import { QuizService } from '../services/quiz-service'
import { UserService } from '../services/user-service'

export interface Repositories {
  userRepository: UserRepository
  cacheRepository: CacheRepository
  quizRepository: QuizRepository
  quizAttemptRepository: QuizAttemptRepository
}

export interface Container {
  userHandler: UserHandler
  quizHandler: QuizHandler
}

export function createContainer(repos: Repositories): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  const quizService = new QuizService(repos.quizRepository, repos.quizAttemptRepository)
  return {
    userHandler: new UserHandler(userService),
    quizHandler: new QuizHandler(quizService),
  }
}
