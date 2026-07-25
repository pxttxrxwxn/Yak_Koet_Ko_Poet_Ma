import z from 'zod'

export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.string(),
  source: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
})

export const createQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  questions: z.string().min(2), // at least []
  source: z.string().optional().default(''),
  createdBy: z.string().optional().default('unknown'),
})

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  questions: z.string().min(2).optional(),
  source: z.string().optional(),
})

export const quizAttemptSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string(),
  answers: z.string(),
  score: z.number(),
  total: z.number(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
})

export const quizResultSchema = z.object({
  data: z.object({
    attempt: quizAttemptSchema,
    quiz: z.object({
      title: z.string(),
      description: z.string(),
      questions: z.string(),
    }),
  }),
})

export const createQuizAttemptSchema = z.object({
  quizId: z.string().min(1),
  userId: z.string().min(1),
  answers: z.string().min(2),
  score: z.number().min(0),
  total: z.number().min(1),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const userIdParamSchema = z.object({
  userId: z.string().min(1),
})

export const quizIdParamSchema = z.object({
  quizId: z.string().min(1),
})

export const quizResponseSchema = z.object({ data: quizSchema })
export const quizListResponseSchema = z.object({ data: z.array(quizSchema) })
export const quizAttemptListResponseSchema = z.object({ data: z.array(quizAttemptSchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
