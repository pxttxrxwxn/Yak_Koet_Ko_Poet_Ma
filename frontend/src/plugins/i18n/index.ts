import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import en from '@/locales/en.json'
import th from '@/locales/th.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, th },
})

export default function (app: App) {
  app.use(i18n)
}
