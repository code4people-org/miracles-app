import { i18nConfig } from '@/i18n/config'

export type AppLocale = typeof i18nConfig.locales[number]

/**
 * Enhanced locale detection logic to infer from desktop/browser settings
 */
export function detectLocale(
  cookieLocale?: string | null,
  urlLocale?: string | null,
  browserLocale?: string
): AppLocale {
  const allowed = new Set(i18nConfig.locales)
  
  // Priority 1: URL parameter (explicit user choice)
  if (urlLocale) {
    const normalized = urlLocale.toLowerCase()
    if (allowed.has(normalized as AppLocale)) {
      return normalized as AppLocale
    }
  }
  
  // Priority 2: Cookie (user's previous choice)
  if (cookieLocale) {
    const normalized = cookieLocale.toLowerCase()
    if (allowed.has(normalized as AppLocale)) {
      return normalized as AppLocale
    }
  }
  
  // Priority 3: Browser/Desktop locale inference
  if (browserLocale) {
    const normalized = browserLocale.toLowerCase()
    
    // Check for supported locales
    for (const locale of i18nConfig.locales) {
      if (normalized.startsWith(locale)) {
        return locale
      }
    }
    
    // Check for language families
    if (normalized.startsWith('zh')) {
      return 'zh'
    }
    if (normalized.startsWith('ja')) {
      return 'ja'
    }
    if (normalized.startsWith('ko')) {
      return 'ko'
    }
    if (normalized.startsWith('ar')) {
      return 'ar'
    }
    if (normalized.startsWith('fr')) {
      return 'fr'
    }
    if (normalized.startsWith('es')) {
      return 'es'
    }
    if (normalized.startsWith('de')) {
      return 'de'
    }
    if (normalized.startsWith('pt')) {
      return 'pt'
    }
    if (normalized.startsWith('it')) {
      return 'it'
    }
    if (normalized.startsWith('en')) {
      return 'en'
    }
  }
  
  // Default fallback
  return i18nConfig.defaultLocale as AppLocale
}

/**
 * Server-side locale detection using cookies
 */
export function detectServerLocale(cookieLocale?: string | null): AppLocale {
  return detectLocale(cookieLocale)
}

/**
 * Client-side locale detection using URL params, cookies, and browser
 */
export function detectClientLocale(
  urlLocale?: string | null,
  cookieLocale?: string | null,
  browserLocale?: string
): AppLocale {
  return detectLocale(cookieLocale, urlLocale, browserLocale)
}

/**
 * Enhanced browser locale detection that considers multiple browser language preferences
 */
export function getBrowserLocale(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  
  // Try to get the primary language
  const primary = navigator.language
  
  // If available, also check navigator.languages for additional preferences
  const languages = navigator.languages || [primary]
  
  // Return the first supported language or the primary language
  for (const lang of languages) {
    const normalized = lang.toLowerCase()
    for (const locale of i18nConfig.locales) {
      if (normalized.startsWith(locale)) {
        return lang
      }
    }
  }
  
  return primary
}

/**
 * Auto-detect and set initial locale from desktop/browser settings
 * This can be called on first visit to set the appropriate language
 */
export function initializeLocaleFromDesktop(): AppLocale {
  const browserLocale = getBrowserLocale()
  return detectLocale(null, null, browserLocale)
}
