<script setup lang="ts">
import { useQuizStore } from '@/stores/use-quiz-store'
import type { CreateQuizBody, Quiz } from '@/models'

const quizStore = useQuizStore()
const { quizzes, isLoading, error } = storeToRefs(quizStore)
const router = useRouter()

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Questions', key: 'questionsCount' },
  { title: 'Source', key: 'source' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingQuiz = ref<Quiz | null>(null)
const deletingQuiz = ref<Quiz | null>(null)

const form = ref<CreateQuizBody>({ title: '', description: '', questions: '[]', source: '' })

function parseQuestionsCount(questions: string): number {
  try {
    return JSON.parse(questions).length
  } catch {
    return 0
  }
}

function openCreate() {
  editingQuiz.value = null
  form.value = { title: '', description: '', questions: '[]', source: '' }
  dialog.value = true
}

function openEdit(quiz: Quiz) {
  editingQuiz.value = quiz
  form.value = {
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
    source: quiz.source,
  }
  dialog.value = true
}

function openDelete(quiz: Quiz) {
  deletingQuiz.value = quiz
  deleteDialog.value = true
}

function startQuiz(quiz: Quiz) {
  router.push({ name: 'quiz-id', params: { id: quiz.id } })
}

function viewHistory() {
  router.push({ name: 'quiz-history-page' })
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingQuiz.value)
      await quizStore.updateQuiz(editingQuiz.value.id, form.value)
    else
      await quizStore.createQuiz(form.value)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingQuiz.value) return
  isSubmitting.value = true
  try {
    await quizStore.deleteQuiz(deletingQuiz.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(() => quizStore.fetchQuizzes())
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard title="Quiz Management">
          <template #title>
            <div class="d-flex align-center justify-space-between pa-4">
              <span class="text-h6">📝 Quiz Management</span>
              <div>
                <VBtn
                  color="secondary"
                  variant="outlined"
                  class="me-2"
                  @click="viewHistory"
                >
                  <VIcon start icon="ri-history-line" />
                  My History
                </VBtn>
                <VBtn
                  color="primary"
                  prepend-icon="ri-questionnaire-line"
                  @click="openCreate"
                >
                  Create Quiz
                </VBtn>
              </div>
            </div>
          </template>

          <VDivider />

          <VAlert
            v-if="error"
            type="error"
            class="ma-4"
            :text="error"
            closable
          />

          <VDataTable
            :headers="headers"
            :items="quizzes"
            :loading="isLoading"
            hover
          >
            <template #item.questionsCount="{ item }">
              <VChip size="small" color="primary">
                {{ parseQuestionsCount(item.questions) }}
              </VChip>
            </template>

            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template #item.action="{ item }">
              <IconBtn @click="startQuiz(item)">
                <VTooltip activator="parent" location="top">Take Quiz</VTooltip>
                <VIcon icon="ri-play-circle-line" color="success" />
              </IconBtn>
              <IconBtn @click="openEdit(item)">
                <VTooltip activator="parent" location="top">Edit</VTooltip>
                <VIcon icon="ri-pencil-line" />
              </IconBtn>
              <IconBtn color="error" @click="openDelete(item)">
                <VTooltip activator="parent" location="top">Delete</VTooltip>
                <VIcon icon="ri-delete-bin-line" />
              </IconBtn>
            </template>

            <template #no-data>
              <div class="text-center py-8 text-disabled">
                No quizzes yet. Click "Create Quiz" to generate one.
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCol>
    </VRow>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="640" persistent>
      <VCard :title="editingQuiz ? 'Edit Quiz' : 'Create Quiz'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField
              v-model="form.title"
              label="Title"
              prepend-inner-icon="ri-questionnaire-line"
              class="mb-4"
              required
            />
            <VTextarea
              v-model="form.description"
              label="Description"
              prepend-inner-icon="ri-information-line"
              class="mb-4"
              rows="2"
            />
            <VTextarea
              v-model="form.questions"
              label="Questions (JSON array)"
              prepend-inner-icon="ri-code-line"
              hint='e.g. [{"question":"...","options":["A","B","C","D"],"correctAnswer":0}]'
              rows="6"
              required
            />
            <VTextField
              v-model="form.source"
              label="Source (e.g. filename)"
              prepend-inner-icon="ri-file-line"
              class="mt-4"
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingQuiz ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Quiz">
        <VCardText>
          Are you sure you want to delete <strong>{{ deletingQuiz?.title }}</strong>?
          This will also delete all attempts for this quiz.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
