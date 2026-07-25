import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createQuizSchema,
  errorResponseSchema,
  idParamSchema,
  updateQuizSchema,
  quizListResponseSchema,
  quizResponseSchema,
  createQuizAttemptSchema,
  quizResultSchema,
  userIdParamSchema,
  quizIdParamSchema,
  quizAttemptListResponseSchema,
} from '../schemas/quiz-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createQuizRouter() {
  const router = new Hono<AppEnv>()

  // ── Quiz CRUD ──

  router.get(
    '/',
    describeRoute({
      tags: ['Quizzes'],
      summary: 'List all quizzes',
      responses: {
        200: { description: 'All quizzes', content: jsonContent(quizListResponseSchema) },
      },
    }),
    (c) => c.get('container').quizHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Quizzes'],
      summary: 'Create a quiz',
      responses: {
        201: { description: 'Quiz created', content: jsonContent(quizResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createQuizSchema),
    (c) => c.get('container').quizHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Quizzes'],
      summary: 'Get a quiz by id',
      responses: {
        200: { description: 'Quiz found', content: jsonContent(quizResponseSchema) },
        404: { description: 'Quiz not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').quizHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Quizzes'],
      summary: 'Update a quiz',
      responses: {
        200: { description: 'Quiz updated', content: jsonContent(quizResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Quiz not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateQuizSchema),
    (c) => c.get('container').quizHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Quizzes'],
      summary: 'Delete a quiz',
      responses: {
        204: { description: 'Quiz deleted' },
        404: { description: 'Quiz not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').quizHandler.delete(c)
  )

  // ── Quiz Attempts ──

  router.get(
    '/attempts/user/:userId',
    describeRoute({
      tags: ['QuizAttempts'],
      summary: 'List attempts by user',
      responses: {
        200: { description: 'User attempts', content: jsonContent(quizAttemptListResponseSchema) },
      },
    }),
    validator('param', userIdParamSchema),
    (c) => c.get('container').quizHandler.listAttemptsByUser(c)
  )

  router.get(
    '/:quizId/attempts',
    describeRoute({
      tags: ['QuizAttempts'],
      summary: 'List attempts for a quiz',
      responses: {
        200: { description: 'Quiz attempts', content: jsonContent(quizAttemptListResponseSchema) },
      },
    }),
    validator('param', quizIdParamSchema),
    (c) => c.get('container').quizHandler.listAttemptsByQuiz(c)
  )

  router.post(
    '/:quizId/attempts',
    describeRoute({
      tags: ['QuizAttempts'],
      summary: 'Submit a quiz attempt (auto-graded)',
      responses: {
        201: { description: 'Attempt submitted with score', content: jsonContent(quizResultSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Quiz not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', quizIdParamSchema),
    validator('json', createQuizAttemptSchema),
    (c) => c.get('container').quizHandler.submitAttempt(c)
  )

  return router
}
