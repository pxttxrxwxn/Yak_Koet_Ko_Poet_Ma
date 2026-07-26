<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useQuizStore } from '@/stores/use-quiz-store'
import { quizApi } from '@/apis/quiz-api'

useSEO({
  title: 'Dashboard - E XAM',
  description: 'Exam quiz system dashboard - ระบบสร้างแบบทดสอบก่อนสอบจากไฟล์เรียน',
  keywords: ['dashboard', 'quiz', 'exam', 'test', 'education'],
})

const quizStore = useQuizStore()
const totalAttempts = ref(0)

onMounted(async () => {
  await quizStore.fetchQuizzes()

  // Count total attempts across all quizzes
  try {
    const attRes = await quizApi.listAttemptsByUser('anonymous')
    totalAttempts.value = attRes.data.length
  }
  catch {
    // ignore
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

const router = useRouter()
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">
      📊 E XAM Dashboard
    </h1>

    <!-- Stats Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-questionnaire-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">
                Total Quizzes
              </div>
              <div class="text-h5 font-weight-bold">
                {{ quizStore.quizzes.length }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-history-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">
                Total Attempts
              </div>
              <div class="text-h5 font-weight-bold">
                {{ totalAttempts }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="12" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="warning" variant="tonal" size="48">
              <VIcon icon="ri-flashlight-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">
                Quick Action
              </div>
              <VBtn size="small" color="primary" @click="router.push({ name: 'quiz-page' })">
                Take a Quiz
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- Recent Quizzes -->
      <VCol cols="12">
        <VCard title="Recent Quizzes">
          <VList lines="two">
            <VListItem
              v-for="quiz in quizStore.quizzes.slice(0, 5)"
              :key="quiz.id"
              :color="quizStore.activeQuizId === quiz.id ? 'primary' : undefined"
              class="cursor-pointer"
              @click="
                quizStore.setActiveQuizId(quiz.id);
                router.push({ name: 'quiz-id', params: { id: quiz.id } })
              "
            >
              <template #prepend>
                <VAvatar
                  :color="quizStore.activeQuizId === quiz.id ? 'primary' : 'primary'"
                  :variant="quizStore.activeQuizId === quiz.id ? 'flat' : 'tonal'"
                  size="36"
                >
                  <VIcon icon="ri-questionnaire-line" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ quiz.title }}</VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(quiz.createdAt) }} — {{ JSON.parse(quiz.questions).length }} questions
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="quizStore.quizzes.length === 0" class="text-center text-medium-emphasis py-4">
              No quizzes yet.
            </VListItem>
          </VList>
          <VCardActions>
            <VBtn variant="text" size="small" @click="router.push({ name: 'quiz-page' })">
              View all quizzes
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
