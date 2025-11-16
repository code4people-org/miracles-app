'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, User, Cross } from 'lucide-react'
import GradientIcon from '@/components/ui/GradientIcon'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

interface UserActionsProps {
  onShowAuthModal: () => void
  onShowMiracleForm: () => void
  onShowPrayerForm: () => void
  onShowUserModal: () => void
}

export default function UserActions({
  onShowAuthModal,
  onShowMiracleForm,
  onShowPrayerForm,
  onShowUserModal
}: UserActionsProps) {
  const { user } = useAuth()
  const { getTranslation } = useTranslation()

  if (user) {
    return (
      <>
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Share Miracle Button - Hidden on mobile, shown as FAB */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowMiracleForm}
            className="hidden lg:flex btn-miracle text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">{getTranslation('miracles.shareMiracle', 'Share good things')}</span>
            <span className="lg:hidden">{getTranslation('miracles.share', 'Share')}</span>
          </motion.button>

          {/* Request Prayer Button - Hidden on mobile, shown as FAB */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowPrayerForm}
            className="hidden lg:flex bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold items-center space-x-2 text-sm sm:text-base transition-colors duration-200"
          >
            <Cross className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">{getTranslation('prayers.requestPrayer', 'I need help')}</span>
            <span className="lg:hidden">{getTranslation('prayers.requestPrayer', 'Help')}</span>
          </motion.button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowUserModal}
              className="p-1 sm:p-2 text-gray-600 hover:text-miracle-gold transition-colors duration-200 touch-manipulation"
              title={getTranslation('navigation.profile', 'Profile')}
            >
              <GradientIcon icon={User} gradient="teal" />
            </motion.button>
          </div>
        </div>

      </>
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
