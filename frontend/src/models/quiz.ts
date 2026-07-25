export interface Quiz {
  id: string
  title: string
  description: string
  questions: string
  source: string
  createdBy: string
  createdAt: string
}

export interface CreateQuizBody {
  title: string
  description?: string
  questions: string
  source?: string
  createdBy?: string
}

export interface UpdateQuizBody {
  title?: string
  description?: string
  questions?: string
  source?: string
}

export interface QuizListResponse {
  data: Quiz[]
}

export interface QuizResponse {
  data: Quiz
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: string
  score: number
  total: number
  completedAt: string | null
  createdAt: string
}

export interface CreateQuizAttemptBody {
  quizId: string
  userId: string
  answers: string
  score: number
  total: number
}

export interface QuizResultResponse {
  data: {
    attempt: QuizAttempt
    quiz: {
      title: string
      description: string
      questions: string
    }
  }
}

export interface QuizAttemptListResponse {
  data: QuizAttempt[]
}

export interface Question {
  question: string
  options: string[]
  correctAnswer: number
}
