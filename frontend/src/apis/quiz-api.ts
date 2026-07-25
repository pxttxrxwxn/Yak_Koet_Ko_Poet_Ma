import type {
  CreateQuizAttemptBody,
  CreateQuizBody,
  QuizAttemptListResponse,
  QuizListResponse,
  QuizResponse,
  QuizResultResponse,
  UpdateQuizBody,
} from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/quizzes`

export const quizApi = {
  // Quiz CRUD
  list: () => request<QuizListResponse>(BASE),
  get: (id: string) => request<QuizResponse>(`${BASE}/${id}`),
  create: (body: CreateQuizBody) => request<QuizResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateQuizBody) => request<QuizResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),

  // Attempts
  listAttemptsByUser: (userId: string) => request<QuizAttemptListResponse>(`${BASE}/attempts/user/${userId}`),
  listAttemptsByQuiz: (quizId: string) => request<QuizAttemptListResponse>(`${BASE}/${quizId}/attempts`),
  submitAttempt: (quizId: string, body: CreateQuizAttemptBody) => request<QuizResultResponse>(`${BASE}/${quizId}/attempts`, { method: 'POST', body: JSON.stringify(body) }),
}
