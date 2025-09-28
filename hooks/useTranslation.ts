import { useTranslations } from 'next-intl'

export function useTranslation() {
  const t = useTranslations()
  
  const getTranslation = (key: string, fallback: string) => {
    try {
      return t(key) || fallback
    } catch (error) {
      console.warn(`Translation key "${key}" not found, using fallback:`, fallback)
      return fallback
    }
  }

  return { getTranslation }
}
