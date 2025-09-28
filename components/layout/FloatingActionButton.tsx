'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Cross } from 'lucide-react'

interface FloatingActionButtonProps {
  user: any
  onShowMiracleForm: () => void
  onShowPrayerForm: () => void
}

export default function FloatingActionButton({ user, onShowMiracleForm, onShowPrayerForm }: FloatingActionButtonProps) {
  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3 md:hidden">
      {/* Request Prayer Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onShowPrayerForm}
        className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full shadow-lg flex items-center justify-center"
      >
        <Cross className="w-6 h-6 text-white" />
      </motion.button>

      {/* Share Miracle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onShowMiracleForm}
        className="w-14 h-14 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  )
}
