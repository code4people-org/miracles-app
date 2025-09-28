export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar'] as const
}

export type AppLocale = typeof i18nConfig.locales[number]