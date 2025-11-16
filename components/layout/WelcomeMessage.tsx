'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, ChevronDown, ChevronUp } from 'lucide-react'
import GradientIcon from '@/components/ui/GradientIcon'

interface WelcomeMessageProps {
  user: any
  showAuthModal: boolean
  onShowAuthModal: () => void
  getTranslation: (key: string, fallback: string) => string
}

export default function WelcomeMessage({
  user,
  showAuthModal,
  onShowAuthModal,
  getTranslation
}: WelcomeMessageProps) {
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('welcomeMessageMinimized') === 'true'
    }
    return false
  })

  if (user || showAuthModal) return null

  const handleToggle = () => {
    const newState = !isMinimized
    setIsMinimized(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeMessageMinimized', String(newState))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 right-6 z-30 md:left-auto md:right-6 md:w-96"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-miracle-gold/20 relative overflow-hidden">
        <div className={`p-6 ${isMinimized ? 'pb-4' : ''}`}>
          <div className={`flex items-center justify-between ${isMinimized ? '' : 'mb-3'}`}>
            <div className="flex items-center space-x-2">
              <GradientIcon icon={Heart} gradient="gold" size="sm" />
              <h3 className="text-base font-bold text-gray-800">
                {getTranslation('welcome.title', 'Discover & Share Life\'s Small Miracles')}
              </h3>
            </div>
            <button
              onClick={handleToggle}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="text-center">
          <p className="text-gray-600 mb-4">
            {getTranslation('welcome.subtitle', 'From a stranger\'s kindness to nature\'s beauty - share the positive moments that make life wonderful.')}
          </p>
          
          {/* Features List */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-miracle-gold">✨</span>
              <span>{getTranslation('welcome.explore', 'Explore miracles from around the world')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-miracle-gold">💝</span>
              <span>{getTranslation('welcome.share', 'Share your own positive experiences')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-miracle-gold">🌍</span>
              <span>{getTranslation('welcome.connect', 'Connect with a global community')}</span>
            </div>
          </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onShowAuthModal}
                    className="btn-miracle text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    {getTranslation('welcome.getStarted', 'Get Started')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
