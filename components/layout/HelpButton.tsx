'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import HelpModal from '@/components/ui/HelpModal'

interface HelpButtonProps {
  getTranslation: (key: string, fallback: string) => string
}

export default function HelpButton({ getTranslation }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Help Button - Mobile Only */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-40 w-12 h-12 bg-gradient-to-br from-miracle-sky to-miracle-teal rounded-full shadow-lg flex items-center justify-center md:hidden"
        title={getTranslation('help.title', 'Help')}
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Help Modal - Mobile Only */}
      <HelpModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        getTranslation={getTranslation}
        position="bottom"
      />
    </>
  )
}
