'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
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
  if (user || showAuthModal) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 right-6 z-30 md:left-auto md:right-6 md:w-96"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-miracle-gold/20">
        <div className="text-center">
          <div className="mb-4">
            <GradientIcon icon={Heart} gradient="gold" size="lg" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {getTranslation('welcome.title', 'See and share the small miracles happening all around the world')}
          </h3>
          <p className="text-gray-600 mb-4">
            {getTranslation('welcome.subtitle', 'Join our community of positivity and inspiration')}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowAuthModal}
            className="btn-miracle text-white px-6 py-2 rounded-lg font-semibold"
          >
            {getTranslation('welcome.getStarted', 'Get Started')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
