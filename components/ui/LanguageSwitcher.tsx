'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { detectClientLocale, getBrowserLocale } from '@/lib/locale'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('en')

  useEffect(() => {
    const urlLocale = searchParams?.get('locale')
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1]
    const browserLocale = getBrowserLocale()
    
    const locale = detectClientLocale(urlLocale, cookieLocale, browserLocale)
    setCurrentLocale(locale)
  }, [searchParams])

  const currentLanguage = languages.find(lang => lang.code === currentLocale)

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie for locale preference
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // Update URL with new locale parameter
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '')
    newSearchParams.set('locale', newLocale)
    
    router.push(`/?${newSearchParams.toString()}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        title="Change Language"
      >
        <Globe className="w-4 h-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="text-sm font-medium text-gray-700 sm:hidden">
          {currentLanguage?.flag}
        </span>
      </motion.button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-miracle-gold/20 z-20 overflow-hidden"
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Select Language
              </div>
              {languages.map((language) => (
                <motion.button
                  key={language.code}
                  whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.1)' }}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    currentLocale === language.code 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                  {currentLocale === language.code && (
                    <Check className="w-4 h-4 text-gray-600" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
