import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createQuizRouter } from './quiz-router'
import { createUserRouter } from './user-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/quizzes', createQuizRouter())

  return api
}
