'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Filter, Clock, MapPin, Tag } from 'lucide-react'
import { miracleCategories } from '@/lib/miracleCategories'

interface FiltersProps {
  filters: {
    category: string
    timeRange: string
    proximity: number
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
  getTranslation: (key: string, fallback: string) => string
}

const timeRanges = [
  { value: '', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '1y', label: 'Last Year' },
]

const proximityOptions = [
  { value: 0, label: 'Anywhere' },
  { value: 1, label: 'Within 1 km' },
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 100, label: 'Within 100 km' },
]

export default function Filters({ filters, onFiltersChange, onClose, getTranslation }: FiltersProps) {
  const categories = [
    { value: '', label: getTranslation('filters.allCategories', 'All Categories'), icon: '✨' },
    ...miracleCategories.map(cat => ({
      value: cat.value,
      label: getTranslation(`miracles.categories.${cat.value}`, cat.label),
      icon: cat.icon
    }))
  ]
  const updateFilter = (key: string, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      timeRange: '',
      proximity: 0,
    })
  }

  const hasActiveFilters = filters.category || filters.timeRange || filters.proximity > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-miracle-gold/20 p-4 max-h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-miracle-gold" />
          <h3 className="text-lg font-bold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={clearFilters}
          className="w-full mb-4 px-4 py-2 text-sm text-miracle-gold hover:text-miracle-coral transition-colors duration-200 border border-miracle-gold/30 rounded-lg hover:border-miracle-coral/50"
        >
          Clear All Filters
        </motion.button>
      )}

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="w-4 h-4 text-miracle-gold" />
            <label className="text-sm font-medium text-gray-700">Category</label>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('category', category.value)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 text-left ${
                  filters.category === category.value
                    ? 'bg-miracle-gold/20 border-2 border-miracle-gold'
                    : 'bg-gray-50 hover:bg-miracle-gold/10 border-2 border-transparent'
                }`}
              >
                <span className="text-sm">{category.icon}</span>
                <span className="text-xs font-medium text-gray-700">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Range Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-miracle-gold" />
            <label className="text-sm font-medium text-gray-700">Time Range</label>
          </div>
          <div className="space-y-1">
            {timeRanges.map((range) => (
              <motion.button
                key={range.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('timeRange', range.value)}
                className={`w-full p-2 rounded-lg transition-all duration-200 text-left ${
                  filters.timeRange === range.value
                    ? 'bg-miracle-gold/20 border-2 border-miracle-gold'
                    : 'bg-gray-50 hover:bg-miracle-gold/10 border-2 border-transparent'
                }`}
              >
                <span className="text-xs font-medium text-gray-700">{range.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Proximity Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-miracle-gold" />
            <label className="text-sm font-medium text-gray-700">Proximity</label>
          </div>
          <div className="space-y-1">
            {proximityOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('proximity', option.value)}
                className={`w-full p-2 rounded-lg transition-all duration-200 text-left ${
                  filters.proximity === option.value
                    ? 'bg-miracle-gold/20 border-2 border-miracle-gold'
                    : 'bg-gray-50 hover:bg-miracle-gold/10 border-2 border-transparent'
                }`}
              >
                <span className="text-xs font-medium text-gray-700">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-3 border-t border-gray-200"
        >
          <h4 className="text-xs font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-1">
            {filters.category && (
              <span className="px-2 py-1 bg-miracle-gold/20 text-miracle-gold text-xs rounded-full">
                {categories.find(c => c.value === filters.category)?.label}
              </span>
            )}
            {filters.timeRange && (
              <span className="px-2 py-1 bg-miracle-teal/20 text-miracle-teal text-xs rounded-full">
                {timeRanges.find(t => t.value === filters.timeRange)?.label}
              </span>
            )}
            {filters.proximity > 0 && (
              <span className="px-2 py-1 bg-miracle-sky/20 text-miracle-sky text-xs rounded-full">
                {proximityOptions.find(p => p.value === filters.proximity)?.label}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
