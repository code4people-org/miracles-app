'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown } from 'lucide-react'
import { miracleCategories } from '@/lib/miracleCategories'

interface MiracleCategoriesLegendProps {
  getTranslation: (key: string, fallback: string) => string
}

export default function MiracleCategoriesLegend({ getTranslation }: MiracleCategoriesLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Memoize the categories list to avoid re-rendering on every translation change
  const categoriesList = useMemo(() => {
    return miracleCategories.map((category) => (
      <div key={category.value} className="flex items-center">
        <span className="text-gray-800">
          {category.emoji} {getTranslation(`miracles.categories.${category.value}`, category.label)}
        </span>
      </div>
    ))
  }, [getTranslation])
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-miracle-gold/20 pointer-events-auto z-10"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <h3 className="font-semibold text-gray-800 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-miracle-gold" />
          {getTranslation('map.miracleCategories', 'Categories')}
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 text-sm">
              {categoriesList}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
