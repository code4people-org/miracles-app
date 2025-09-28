'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Map } from 'lucide-react'
import { mapTypes, type MapType } from '@/lib/mapTypes'

interface MapTypeSelectorProps {
  selectedMapType: MapType
  onMapTypeChange: (mapType: MapType) => void
  getTranslation: (key: string, fallback: string) => string
}

export default function MapTypeSelector({ 
  selectedMapType, 
  onMapTypeChange, 
  getTranslation 
}: MapTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMapTypeSelect = useCallback((mapType: MapType) => {
    onMapTypeChange(mapType)
    setIsOpen(false)
  }, [onMapTypeChange])

  // Memoize map type options to avoid re-rendering
  const mapTypeOptions = useMemo(() => {
    return mapTypes.map((mapType) => (
      <motion.button
        key={mapType.id}
        whileHover={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
        onClick={() => handleMapTypeSelect(mapType)}
        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
          selectedMapType.id === mapType.id
            ? 'bg-miracle-gold/20 text-miracle-gold'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="text-lg">{mapType.icon}</span>
        <div className="flex-1 text-left">
          <div className="font-medium text-sm">{mapType.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {mapType.description}
          </div>
        </div>
        {selectedMapType.id === mapType.id && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-miracle-gold rounded-full"
          />
        )}
      </motion.button>
    ))
  }, [selectedMapType.id, handleMapTypeSelect])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-miracle-gold/20 hover:bg-white transition-all duration-200"
        title={getTranslation('map.selectMapType', 'Select Map Type')}
      >
        <span className="text-lg">{selectedMapType.icon}</span>
        <span className="hidden lg:block text-sm font-medium text-gray-800">
          {selectedMapType.name}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 max-w-[90vw] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-miracle-gold/20 z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <Map className="w-3 h-3" />
                <span>{getTranslation('map.mapTypes', 'Map Types')}</span>
              </div>
              
              <div className="py-1">
                {mapTypeOptions}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile version with horizontal scroll
export function MapTypeSelectorMobile({ 
  selectedMapType, 
  onMapTypeChange, 
  getTranslation 
}: MapTypeSelectorProps) {
  const handleMapTypeSelect = useCallback((mapType: MapType) => {
    onMapTypeChange(mapType)
  }, [onMapTypeChange])

  // Memoize mobile map type options
  const mobileMapTypeOptions = useMemo(() => {
    return mapTypes.map((mapType) => (
      <motion.button
        key={mapType.id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleMapTypeSelect(mapType)}
        className={`flex-shrink-0 flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
          selectedMapType.id === mapType.id
            ? 'bg-miracle-gold/20 text-miracle-gold'
            : 'bg-white/90 text-gray-700 hover:bg-white'
        }`}
        title={mapType.description}
      >
        <span className="text-lg">{mapType.icon}</span>
        <span className="text-xs font-medium whitespace-nowrap text-center leading-tight">
          {mapType.name}
        </span>
      </motion.button>
    ))
  }, [selectedMapType.id, handleMapTypeSelect])

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {mobileMapTypeOptions}
    </div>
  )
}
