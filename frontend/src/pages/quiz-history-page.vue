<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/use-quiz-store'

const quizStore = useQuizStore()
const { error } = storeToRefs(quizStore)

const loading = ref(false)

const headers = [
  { title: 'Quiz Title', key: 'quizTitle' },
  { title: 'Score', key: 'score' },
]

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      quizStore.fetchQuizzes(),
      quizStore.fetchAttemptsByUser('anonymous'),
    ])
  }
  catch (e: any) {
    console.error('Failed to load history', e)
  }
  finally {
    loading.value = false
  }
}

const mappedAttempts = computed(() => {
  const quizMap = new Map(quizStore.quizzes.map(q => [q.id, q]))
  return quizStore.attempts.map((a) => {
    const q = quizMap.get(a.quizId)
    return {
      ...a,
      quizTitle: q?.title ?? 'Unknown Quiz',
      percentage: a.total > 0 ? Math.round(a.score / a.total * 100) : 0,
    }
  })
})

function formatDate(iso: string | null) {
  if (!iso)
    return '-'
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

function scoreColor(percentage: number) {
  if (percentage >= 80)
    return 'success'
  if (percentage >= 50)
    return 'warning'
  return 'error'
}

const router = useRouter()

onMounted(() => loadData())
</script>

<template>
  <div>
    <VCard title="Quiz History">
      <template #title>
        <div class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6">📊 Quiz History</span>
          <VBtn
            color="primary"
            variant="outlined"
            @click="router.push({ name: 'quiz-page' })"
          >
            <VIcon start icon="ri-arrow-left-line" />
            Back to Quizzes
          </VBtn>
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
        :items="mappedAttempts"
        :loading="loading"
        hover
      >
        <template #item.score="{ item }">
          <strong>{{ item.score }}</strong> / {{ item.total }}
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            <VIcon icon="ri-history-line" size="48" class="mb-2" />
            <div>No quiz attempts yet. Take a quiz to see your history!</div>
            <VBtn
              color="primary"
              class="mt-4"
              @click="router.push({ name: 'quiz-page' })"
            >
              Browse Quizzes
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
