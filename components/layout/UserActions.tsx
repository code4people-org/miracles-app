'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, User, LogOut } from 'lucide-react'

interface UserActionsProps {
  user: any
  onSignOut: () => void
  onShowAuthModal: () => void
  onShowMiracleForm: () => void
  getTranslation: (key: string, fallback: string) => string
}

export default function UserActions({
  user,
  onSignOut,
  onShowAuthModal,
  onShowMiracleForm,
  getTranslation
}: UserActionsProps) {
  if (user) {
    return (
      <div className="flex items-center space-x-1 sm:space-x-3">
        {/* Share Miracle Button - Hidden on mobile, shown as FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowMiracleForm}
          className="hidden sm:flex btn-miracle text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold items-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden md:inline">{getTranslation('miracles.shareMiracle', 'Share Miracle')}</span>
          <span className="md:hidden">{getTranslation('miracles.share', 'Share')}</span>
        </motion.button>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-miracle-teal to-miracle-sky rounded-full flex items-center justify-center">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <button
            onClick={onSignOut}
            className="p-1 sm:p-2 text-gray-600 hover:text-miracle-gold transition-colors duration-200 touch-manipulation"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onShowAuthModal}
      className="btn-miracle text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base touch-manipulation"
    >
      {getTranslation('navigation.signIn', 'Sign In')}
    </motion.button>
  )
}
