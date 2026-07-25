export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  /** JSON object of user's answers: { questionIndex: selectedOption } */
  answers: string
  score: number
  total: number
  completedAt: string | null
  createdAt: string
}

export interface CreateQuizAttemptInput {
  quizId: string
  userId: string
  answers: string
  score: number
  total: number
}

export interface QuizResult {
  attempt: QuizAttempt
  quiz: {
    title: string
    description: string
    questions: string
  }
}
