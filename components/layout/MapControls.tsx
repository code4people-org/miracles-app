'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize, Globe } from 'lucide-react'

interface MapControlsProps {
  zoomControls: {
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  } | null
  getTranslation: (key: string, fallback: string) => string
}

export default function MapControls({ zoomControls, getTranslation }: MapControlsProps) {
  if (!zoomControls) return null

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={zoomControls.zoomOut}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
        title={getTranslation('map.zoomOut', 'Zoom Out')}
      >
        <ZoomOut className="w-4 h-4 text-gray-700" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={zoomControls.zoomIn}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
        title={getTranslation('map.zoomIn', 'Zoom In')}
      >
        <ZoomIn className="w-4 h-4 text-gray-700" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={zoomControls.fitBounds}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
        title={getTranslation('map.fitBounds', 'Fit All Miracles')}
      >
        <Maximize className="w-4 h-4 text-gray-700" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={zoomControls.worldView}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
        title={getTranslation('map.worldView', 'Show Full World')}
      >
        <Globe className="w-4 h-4 text-gray-700" />
      </motion.button>
    </div>
  )
}
