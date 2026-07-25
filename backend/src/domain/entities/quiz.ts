export interface Quiz {
  id: string
  title: string
  description: string
  /** JSON array of question objects */
  questions: string
  /** Source file key / description (e.g. original PDF/PPTX name) */
  source: string
  createdBy: string
  createdAt: string
}

export interface CreateQuizInput {
  title: string
  description: string
  questions: string
  source: string
  createdBy: string
}

export interface UpdateQuizInput {
  title?: string
  description?: string
  questions?: string
  source?: string
}
