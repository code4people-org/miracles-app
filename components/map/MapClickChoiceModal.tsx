'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Heart, Hand } from 'lucide-react'

interface MapClickChoiceModalProps {
  onClose: () => void
  onShareMiracle: () => void
  onRequestPrayers: () => void
  getTranslation: (key: string, fallback: string) => string
}

export default function MapClickChoiceModal({
  onClose,
  onShareMiracle,
  onRequestPrayers,
  getTranslation
}: MapClickChoiceModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-4 pr-8">
          {getTranslation('map.clickChoice.title', 'What would you like to do?')}
        </h3>

        <div className="space-y-3">
          <button
            onClick={onShareMiracle}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-miracle-gold hover:bg-miracle-gold/5 transition-all flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-800">
              {getTranslation('map.clickChoice.shareMiracle', 'Share a miracle')}
            </span>
          </button>

          <button
            onClick={onRequestPrayers}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shrink-0">
              <Hand className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-800">
              {getTranslation('map.clickChoice.requestPrayers', 'Request prayers')}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
