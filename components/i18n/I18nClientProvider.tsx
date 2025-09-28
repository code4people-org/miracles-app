'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import en from '@/i18n/messages/en.json'
import { getMessages } from '@/i18n/registry'
import { detectClientLocale, getBrowserLocale } from '@/lib/locale'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export default function I18nClientProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams()
  const localeParam = params?.get('locale')
  const cookieLocale = readCookie('locale')
  const browserLocale = getBrowserLocale()

  const resolvedLocale = detectClientLocale(localeParam, cookieLocale, browserLocale)

  // Initialize with English to avoid rendering without messages on first paint
  const [messages, setMessages] = useState<AbstractIntlMessages>(en as unknown as AbstractIntlMessages)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', resolvedLocale)
    }
  }, [resolvedLocale])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await getMessages(resolvedLocale)
        if (!cancelled) setMessages(loaded as unknown as AbstractIntlMessages)
      } catch {
        if (!cancelled) setMessages(en as unknown as AbstractIntlMessages)
      }
    })()
    return () => { cancelled = true }
  }, [resolvedLocale])

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}
