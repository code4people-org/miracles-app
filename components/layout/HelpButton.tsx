'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X } from 'lucide-react'

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-overlay bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-miracle-gold/20 p-6 modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-miracle-sky" />
                  {getTranslation('help.howToExplore', 'How to Explore')}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-miracle-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-miracle-gold">1</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {getTranslation('help.dragToPan', 'Drag to pan around the world')}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-miracle-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-miracle-gold">2</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {getTranslation('help.scrollToZoom', 'Scroll to zoom in/out')}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-miracle-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-miracle-gold">3</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {getTranslation('help.clickMarkers', 'Click on miracle markers to read stories')}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-miracle-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-miracle-gold">4</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {getTranslation('help.useFilters', 'Use filters to find specific types')}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {getTranslation('help.tip', 'Tip: Use the menu button (☰) to access more options')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
