<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { themeConfig } from '@themeConfig'
import NavBarI18n from '@core/components/I18n.vue'
import { VerticalNavLayout } from '@layouts'
import { useQuizStore } from '@/stores/use-quiz-store'
import navItems from '@/navigation/vertical'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'

// @layouts plugin

const quizStore = useQuizStore()

onMounted(() => {
  quizStore.fetchQuizzes()
})

const dynamicNavItems = computed(() => {
  const items = [...navItems]

  // Find where to append the dynamic quizzes (after 'Quiz History' item)
  const historyIndex = items.findIndex(item => 'title' in item && item.title === 'Quiz History')

  if (historyIndex !== -1 && quizStore.quizzes.length > 0) {
    items.splice(historyIndex + 1, 0, {
      heading: 'Recent Quizzes',
    })

    // Add top 5 quizzes
    quizStore.quizzes.slice(0, 5).forEach((quiz, index) => {
      items.splice(historyIndex + 2 + index, 0, {
        title: quiz.title,
        to: { name: 'quiz-id', params: { id: quiz.id } } as any,
        icon: { icon: 'ri-chat-3-line' },
      })
    })
  }

  return items
})

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

// watching if the fallback state is active and the refLoadingIndicator component is available
watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()

  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
</script>

<template>
  <VerticalNavLayout :nav-items="dynamicNavItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <NavbarThemeSwitcher />
      </div>
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
