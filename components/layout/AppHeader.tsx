'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Filter } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import MapControls from '@/components/layout/MapControls'
import UserActions from '@/components/layout/UserActions'

interface AppHeaderProps {
  getTranslation: (key: string, fallback: string) => string
  zoomControls: {
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  } | null
  showFilters: boolean
  onToggleFilters: () => void
  user: any
  onSignOut: () => void
  onShowAuthModal: () => void
  onShowMiracleForm: () => void
}

export default function AppHeader({
  getTranslation,
  zoomControls,
  showFilters,
  onToggleFilters,
  user,
  onSignOut,
  onShowAuthModal,
  onShowMiracleForm
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-miracle-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">
              {getTranslation('miracles.title', 'Miracles')}
            </h1>
          </motion.div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Map Controls */}
                <MapControls
                  zoomControls={zoomControls}
                  getTranslation={getTranslation}
                />

                {/* Filters Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleFilters}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <Filter className="w-5 h-5 text-gray-700" />
                </motion.button>

                {/* User Actions */}
                <UserActions
                  user={user}
                  onSignOut={onSignOut}
                  onShowAuthModal={onShowAuthModal}
                  onShowMiracleForm={onShowMiracleForm}
                  getTranslation={getTranslation}
                />
              </div>
        </div>
      </div>
    </header>
  )
}
