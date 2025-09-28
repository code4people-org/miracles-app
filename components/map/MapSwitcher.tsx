'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Map } from 'lucide-react'

interface MapSwitcherProps {
  mapType: 'leaflet'
  onMapTypeChange: (type: 'leaflet') => void
}

export default function MapSwitcher({ mapType, onMapTypeChange }: MapSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-miracle-gold/30 p-1 glow-gold">
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => onMapTypeChange('leaflet')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 bg-miracle-gold text-white shadow-md"
          >
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Interactive Map</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
