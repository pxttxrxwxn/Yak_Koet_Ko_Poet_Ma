import { defineStore } from 'pinia'
import { quizApi } from '@/apis/quiz-api'
import type { CreateQuizBody, CreateQuizAttemptBody, Quiz, QuizAttempt, UpdateQuizBody } from '@/models'

export const useQuizStore = defineStore('QuizStore', () => {
  const quizzes = ref<Quiz[]>([])
  const attempts = ref<QuizAttempt[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchQuizzes() {
    isLoading.value = true
    error.value = null
    try {
      const res = await quizApi.list()
      quizzes.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createQuiz(body: CreateQuizBody) {
    const res = await quizApi.create(body)
    quizzes.value.unshift(res.data)
    return res.data
  }

  async function updateQuiz(id: string, body: UpdateQuizBody) {
    const res = await quizApi.update(id, body)
    const idx = quizzes.value.findIndex(q => q.id === id)
    if (idx !== -1) quizzes.value[idx] = res.data
    return res.data
  }

  async function deleteQuiz(id: string) {
    await quizApi.remove(id)
    quizzes.value = quizzes.value.filter(q => q.id !== id)
  }

  async function fetchAttemptsByUser(userId: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await quizApi.listAttemptsByUser(userId)
      attempts.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function submitAttempt(body: CreateQuizAttemptBody) {
    const res = await quizApi.submitAttempt(body.quizId, body)
    attempts.value.unshift(res.data.attempt)
    return res.data
  }

  return {
    quizzes, attempts, isLoading, error,
    fetchQuizzes, createQuiz, updateQuiz, deleteQuiz,
    fetchAttemptsByUser, submitAttempt,
  }
})
