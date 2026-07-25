<script setup lang="ts">
import { useQuizStore } from '@/stores/use-quiz-store'
import { quizApi } from '@/apis/quiz-api'

const quizStore = useQuizStore()
const { isLoading, error } = storeToRefs(quizStore)

const attempts = ref<any[]>([])
const quizCache = ref<Record<string, any>>({})

const headers = [
  { title: 'Quiz Title', key: 'quizTitle' },
  { title: 'Score', key: 'score' },
  { title: 'Percentage', key: 'percentage' },
  { title: 'Completed', key: 'completedAt' },
  { title: 'Result', key: 'result', sortable: false, align: 'end' as const },
]

async function loadData() {
  try {
    // Get all quizzes for mapping
    const quizRes = await quizApi.list()
    const quizMap: Record<string, any> = {}
    quizRes.data.forEach(q => { quizMap[q.id] = q })
    quizCache.value = quizMap

    // Load attempts (using 'anonymous' as default user)
    const attRes = await quizApi.listAttemptsByUser('anonymous')
    attempts.value = attRes.data.map(a => {
      const q = quizMap[a.quizId]
      return {
        ...a,
        quizTitle: q?.title ?? 'Unknown Quiz',
        percentage: Math.round(a.score / a.total * 100),
      }
    })
  } catch (e: any) {
    console.error('Failed to load history', e)
  }
}

function formatDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

function scoreColor(percentage: number) {
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'
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
        :items="attempts"
        :loading="isLoading"
        hover
      >
        <template #item.score="{ item }">
          <strong>{{ item.score }}</strong> / {{ item.total }}
        </template>

        <template #item.percentage="{ item }">
          <VProgressLinear
            :model-value="item.percentage"
            :color="scoreColor(item.percentage)"
            height="20"
            rounded
          >
            <template #default>
              <strong class="text-white text-caption px-2">{{ item.percentage }}%</strong>
            </template>
          </VProgressLinear>
        </template>

        <template #item.completedAt="{ item }">
          {{ formatDate(item.completedAt) }}
        </template>

        <template #item.result="{ item }">
          <VChip
            :color="scoreColor(item.percentage)"
            size="small"
          >
            {{ item.percentage >= 80 ? 'Passed' : item.percentage >= 50 ? 'Fair' : 'Needs Review' }}
          </VChip>
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
