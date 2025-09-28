'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Filter, Menu, X, HelpCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import MapControls from '@/components/layout/MapControls'
import UserActions from '@/components/layout/UserActions'
import MapTypeSelector, { MapTypeSelectorMobile } from '@/components/map/MapTypeSelector'
import type { MapType } from '@/lib/mapTypes'

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
  selectedMapType: MapType
  onMapTypeChange: (mapType: MapType) => void
}

export default function AppHeader({
  getTranslation,
  zoomControls,
  showFilters,
  onToggleFilters,
  user,
  onSignOut,
  onShowAuthModal,
  onShowMiracleForm,
  selectedMapType,
  onMapTypeChange
}: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-miracle-gold/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold gradient-text">
                {getTranslation('miracles.title', 'Miracles')}
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Map Type Selector */}
              <MapTypeSelector
                selectedMapType={selectedMapType}
                onMapTypeChange={onMapTypeChange}
                getTranslation={getTranslation}
              />

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
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 touch-manipulation"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </motion.button>

              {/* Help Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHelpModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 touch-manipulation"
                title={getTranslation('help.title', 'Help')}
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Essential mobile controls */}
              <MapControls
                zoomControls={zoomControls}
                getTranslation={getTranslation}
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-md shadow-2xl border-l border-miracle-gold/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-20 h-full overflow-y-auto">
              {/* Language Switcher */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getTranslation('common.language', 'Language')}
                </h3>
                <LanguageSwitcher />
              </div>

              {/* Map Type Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getTranslation('map.mapTypes', 'Map Types')}
                </h3>
                <MapTypeSelectorMobile
                  selectedMapType={selectedMapType}
                  onMapTypeChange={onMapTypeChange}
                  getTranslation={getTranslation}
                />
              </div>

              {/* Filters Button */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getTranslation('filters.title', 'Filters')}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onToggleFilters()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <Filter className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-700">
                    {getTranslation('filters.title', 'Filters')}
                  </span>
                </motion.button>
              </div>

              {/* User Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getTranslation('navigation.profile', 'Account')}
                </h3>
                <UserActions
                  user={user}
                  onSignOut={onSignOut}
                  onShowAuthModal={onShowAuthModal}
                  onShowMiracleForm={onShowMiracleForm}
                  getTranslation={getTranslation}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div
          className="fixed inset-0 modal-overlay bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsHelpModalOpen(false)}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-miracle-gold/20 max-w-sm w-full pointer-events-auto modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title={getTranslation('common.close', 'Close')}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-miracle-sky" />
              {getTranslation('help.howToExplore', 'How to Explore')}
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 mb-4">
              <li>• {getTranslation('help.dragToPan', 'Drag to pan around the world')}</li>
              <li>• {getTranslation('help.scrollToZoom', 'Scroll to zoom in/out')}</li>
              <li>• {getTranslation('help.clickMarkers', 'Click on miracle markers to read stories')}</li>
              <li>• {getTranslation('help.useFilters', 'Use filters to find specific types')}</li>
            </ul>
          </motion.div>
        </div>
      )}
    </>
  )
}
