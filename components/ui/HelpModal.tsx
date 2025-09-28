'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import Modal from './Modal'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  getTranslation: (key: string, fallback: string) => string
  position?: 'center' | 'bottom'
}

export default function HelpModal({ isOpen, onClose, getTranslation, position = 'center' }: HelpModalProps) {
  const helpItems = [
    { key: 'help.dragToPan', fallback: 'Drag to pan around the world' },
    { key: 'help.scrollToZoom', fallback: 'Scroll to zoom in/out' },
    { key: 'help.clickMarkers', fallback: 'Click on miracle markers to read stories' },
    { key: 'help.useFilters', fallback: 'Use filters to find specific types' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation('help.howToExplore', 'How to Explore')}
      size="sm"
      position={position}
    >
      <div className="space-y-3">
        {helpItems.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-miracle-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-miracle-gold">{index + 1}</span>
            </div>
            <p className="text-sm text-gray-700">
              {getTranslation(item.key, item.fallback)}
            </p>
          </div>
        ))}
      </div>
      
      {position === 'bottom' && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {getTranslation('help.tip', 'Tip: Use the menu button (☰) to access more options')}
          </p>
        </div>
      )}
    </Modal>
  )
}
