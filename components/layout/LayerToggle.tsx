'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Cross, Layers } from 'lucide-react'

export type LayerType = 'miracles' | 'prayers' | 'both'

interface LayerToggleProps {
  activeLayer: LayerType
  onLayerChange: (layer: LayerType) => void
  getTranslation: (key: string, fallback: string) => string
  className?: string
}

export default function LayerToggle({ 
  activeLayer, 
  onLayerChange, 
  getTranslation,
  className = ''
}: LayerToggleProps) {
  const layers = [
    {
      value: 'miracles' as LayerType,
      label: getTranslation('layers.miracles', 'Good Things'),
      icon: Heart,
      color: 'text-miracle-gold',
      bgColor: 'bg-miracle-gold/10',
      borderColor: 'border-miracle-gold/20'
    },
    {
      value: 'prayers' as LayerType,
      label: getTranslation('layers.prayers', 'Help'),
      icon: Cross,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      value: 'both' as LayerType,
      label: getTranslation('layers.both', 'Both'),
      icon: Layers,
      color: 'text-miracle-teal',
      bgColor: 'bg-miracle-teal/10',
      borderColor: 'border-miracle-teal/20'
    }
  ]

  return (
    <div className={`flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 shadow-sm ${className}`}>
      {layers.map((layer) => {
        const Icon = layer.icon
        const isActive = activeLayer === layer.value
        
        return (
          <motion.button
            key={layer.value}
            onClick={() => onLayerChange(layer.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive 
                ? `${layer.bgColor} ${layer.color} ${layer.borderColor} border shadow-sm` 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            title={layer.label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{layer.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

// Mobile version with just icons
export function LayerToggleMobile({ 
  activeLayer, 
  onLayerChange, 
  getTranslation,
  className = ''
}: LayerToggleProps) {
  const layers = [
    {
      value: 'miracles' as LayerType,
      icon: Heart,
      color: 'text-miracle-gold',
      bgColor: 'bg-miracle-gold/10',
      title: getTranslation('layers.miracles', 'Good Things')
    },
    {
      value: 'prayers' as LayerType,
      icon: Cross,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: getTranslation('layers.prayers', 'Help')
    },
    {
      value: 'both' as LayerType,
      icon: Layers,
      color: 'text-miracle-teal',
      bgColor: 'bg-miracle-teal/10',
      title: getTranslation('layers.both', 'Both')
    }
  ]

  return (
    <div className={`flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 shadow-sm ${className}`}>
      {layers.map((layer) => {
        const Icon = layer.icon
        const isActive = activeLayer === layer.value
        
        return (
          <motion.button
            key={layer.value}
            onClick={() => onLayerChange(layer.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-200
              ${isActive 
                ? `${layer.bgColor} ${layer.color} border shadow-sm` 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            title={layer.title}
          >
            <Icon className="w-4 h-4" />
          </motion.button>
        )
      })}
    </div>
  )
}
