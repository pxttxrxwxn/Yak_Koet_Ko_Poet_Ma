<script setup lang="ts">
import { useQuizStore } from '@/stores/use-quiz-store'
import type { Question } from '@/models'

const route = useRoute<'quiz-id'>()
const router = useRouter()
const quizStore = useQuizStore()

const quizId = route.params.id
const quiz = ref<any>(null)
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const selectedAnswers = ref<Record<number, number>>({})
const showResult = ref(false)
const result = ref<{ score: number; total: number; correctAnswers: Record<number, number> } | null>(null)
const isSubmitting = ref(false)

onMounted(async () => {
  quizStore.setActiveQuizId(quizId)

  try {
    const res = await quizStore.quizzes.length > 0
      ? { data: quizStore.quizzes.find(q => q.id === quizId) }
      : await (await import('@/apis/quiz-api')).quizApi.get(quizId)

    if (!res?.data) {
      // Fetch directly
      const apiRes = await (await import('@/apis/quiz-api')).quizApi.get(quizId)
      quiz.value = apiRes.data
    }
    else {
      quiz.value = res.data
    }

    questions.value = JSON.parse(quiz.value.questions)
  }
  catch (e: any) {
    console.error('Failed to load quiz', e)
  }
})

onUnmounted(() => {
  quizStore.setActiveQuizId(null)
})

const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
const totalQuestions = computed(() => questions.value.length)
const answeredCount = computed(() => Object.keys(selectedAnswers.value).length)

function selectAnswer(optionIndex: number) {
  selectedAnswers.value[currentIndex.value] = optionIndex
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function goToQuestion(index: number) {
  if (index >= 0 && index < questions.value.length)
    currentIndex.value = index
}

async function submitQuiz() {
  isSubmitting.value = true

  // Calculate score
  let score = 0
  const correctAnswers: Record<number, number> = {}

  questions.value.forEach((q, idx) => {
    correctAnswers[idx] = q.correctAnswer
    if (selectedAnswers.value[idx] === q.correctAnswer) {
      score++
    }
  })

  result.value = {
    score,
    total: questions.value.length,
    correctAnswers,
  }

  showResult.value = true
  isSubmitting.value = false

  // Save attempt to backend
  try {
    await quizStore.submitAttempt({
      quizId,
      userId: 'anonymous',
      answers: JSON.stringify(selectedAnswers.value),
      score,
      total: questions.value.length,
    })
  }
  catch {
    // silently fail — result is already shown locally
  }
}

function goBack() {
  router.push({ name: 'quiz-page' })
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <VCard v-if="!quiz" :loading="true" class="mb-4" height="200" />

    <!-- Error / Not Found -->
    <VCard v-else-if="!quiz.id" class="mb-4">
      <VCardText class="text-center py-8">
        <VIcon icon="ri-error-warning-line" size="64" color="error" />
        <h3 class="mt-4">
          Quiz not found
        </h3>
        <VBtn color="primary" class="mt-4" @click="goBack">
          Back to Quizzes
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Quiz Content -->
    <template v-else-if="!showResult">
      <!-- Header -->
      <VCard class="mb-4">
        <VCardText class="d-flex align-center justify-space-between">
          <div>
            <h3 class="text-h5">
              {{ quiz.title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mt-1">
              {{ quiz.description }}
            </p>
          </div>
          <div class="text-end">
            <div class="text-h6 text-primary">
              {{ answeredCount }} / {{ totalQuestions }}
            </div>
            <div class="text-caption">
              Answered
            </div>
          </div>
        </VCardText>
        <VCardActions class="pt-0 px-4 pb-4">
          <VBtn
            variant="outlined"
            color="secondary"
            size="small"
            @click="goBack"
          >
            <VIcon start icon="ri-arrow-left-line" />
            Back
          </VBtn>
          <VSpacer />
          <VBtn
            color="success"
            :disabled="answeredCount < totalQuestions"
            @click="submitQuiz"
          >
            <VIcon start icon="ri-check-double-line" />
            Submit Quiz
          </VBtn>
        </VCardActions>
      </VCard>

      <!-- Progress Bar -->
      <VCard class="mb-4">
        <VCardText>
          <div class="d-flex align-center gap-4 flex-wrap">
            <template v-for="(_, idx) in questions" :key="idx">
              <VBtn
                :color="selectedAnswers[idx] !== undefined ? 'primary' : 'default'"
                :variant="currentIndex === idx ? 'flat' : 'outlined'"
                size="small"
                :icon="true"
                class="question-nav-btn"
                @click="goToQuestion(idx)"
              >
                {{ idx + 1 }}
              </VBtn>
            </template>
          </div>
        </VCardText>
      </VCard>

      <!-- Current Question -->
      <VCard v-if="currentQuestion" class="mb-4">
        <VCardText>
          <div class="text-caption text-medium-emphasis mb-2">
            Question {{ currentIndex + 1 }} of {{ totalQuestions }}
          </div>
          <h4 class="text-h6 mb-4">
            {{ currentQuestion.question }}
          </h4>

          <VRadioGroup
            :model-value="selectedAnswers[currentIndex]"
            @update:model-value="(val) => selectAnswer(val as number)"
          >
            <VLabel class="mb-2">
              Choose your answer:
            </VLabel>
            <VRadio
              v-for="(option, oIdx) in currentQuestion.options"
              :key="oIdx"
              :label="option"
              :value="oIdx"
              class="mb-2"
              color="primary"
            />
          </VRadioGroup>
        </VCardText>

        <VCardActions class="justify-space-between pa-4">
          <VBtn
            variant="outlined"
            :disabled="currentIndex === 0"
            @click="prevQuestion"
          >
            <VIcon start icon="ri-arrow-left-s-line" />
            Previous
          </VBtn>
          <VBtn
            variant="outlined"
            color="primary"
            :disabled="currentIndex >= totalQuestions - 1"
            @click="nextQuestion"
          >
            Next
            <VIcon end icon="ri-arrow-right-s-line" />
          </VBtn>
        </VCardActions>
      </VCard>
    </template>

    <!-- Result Screen -->
    <VCard v-else-if="result">
      <VCardText class="text-center py-8">
        <VIcon
          :icon="result.score / result.total >= 0.5 ? 'ri-emotion-happy-line' : 'ri-emotion-sad-line'"
          :color="result.score / result.total >= 0.5 ? 'success' : 'warning'"
          size="80"
        />
        <h2 class="text-h4 mt-4">
          Quiz Complete!
        </h2>
        <div class="text-h2 text-primary my-4">
          {{ result.score }} / {{ result.total }}
        </div>
        <VChip
          :color="result.score / result.total >= 0.8 ? 'success' : result.score / result.total >= 0.5 ? 'warning' : 'error'"
          size="large"
          class="mb-4"
        >
          {{ Math.round(result.score / result.total * 100) }}%
        </VChip>

        <!-- Question Review -->
        <VList class="text-start mt-4">
          <VListItem
            v-for="(q, idx) in questions"
            :key="idx"
            class="mb-2"
          >
            <VListItemTitle>
              <div class="d-flex align-center">
                <VIcon
                  :icon="selectedAnswers[idx] === result.correctAnswers[idx] ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'"
                  :color="selectedAnswers[idx] === result.correctAnswers[idx] ? 'success' : 'error'"
                  class="me-2"
                />
                <span class="font-weight-medium">{{ q.question }}</span>
              </div>
            </VListItemTitle>
            <VListItemSubtitle class="mt-1">
              <div>
                Your answer: <strong>{{ q.options[selectedAnswers[idx]] ?? 'Not answered' }}</strong>
              </div>
              <div v-if="selectedAnswers[idx] !== result.correctAnswers[idx]" class="text-success">
                Correct answer: <strong>{{ q.options[result.correctAnswers[idx]] }}</strong>
              </div>
            </VListItemSubtitle>
          </VListItem>
        </VList>
      </VCardText>

      <VCardActions class="justify-center pa-4">
        <VBtn color="primary" @click="goBack">
          <VIcon start icon="ri-arrow-left-line" />
          Back to Quizzes
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
.question-nav-btn {
  block-size: 36px;
  min-inline-size: 36px;
}
</style>
