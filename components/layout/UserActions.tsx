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
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowMiracleForm}
          className="btn-miracle text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation('miracles.shareMiracle', 'Share Miracle')}</span>
        </motion.button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-miracle-teal to-miracle-sky rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={onSignOut}
            className="text-gray-600 hover:text-miracle-gold transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
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
      className="btn-miracle text-white px-4 py-2 rounded-lg font-semibold"
    >
      {getTranslation('navigation.signIn', 'Sign In')}
    </motion.button>
  )
}
