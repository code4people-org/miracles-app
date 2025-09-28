'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  user: any
  onShowMiracleForm: () => void
}

export default function FloatingActionButton({ user, onShowMiracleForm }: FloatingActionButtonProps) {
  if (!user) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onShowMiracleForm}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full shadow-lg flex items-center justify-center md:hidden"
    >
      <Plus className="w-6 h-6 text-white" />
    </motion.button>
  )
}
