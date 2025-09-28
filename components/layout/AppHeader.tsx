'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Filter, Menu, X, HelpCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import MapControls from '@/components/layout/MapControls'
import UserActions from '@/components/layout/UserActions'
import UserModal from '@/components/layout/UserModal'
import MapTypeSelector, { MapTypeSelectorMobile } from '@/components/map/MapTypeSelector'
import IconButton from '@/components/ui/IconButton'
import GradientIcon from '@/components/ui/GradientIcon'
import HelpModal from '@/components/ui/HelpModal'
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
  onShowAuthModal,
  onShowMiracleForm,
  selectedMapType,
  onMapTypeChange
}: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

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
              <GradientIcon icon={Heart} gradient="gold" />
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
              <IconButton
                icon={Filter}
                onClick={onToggleFilters}
                title={getTranslation('filters.title', 'Filters')}
              />

              {/* Help Button */}
              <IconButton
                icon={HelpCircle}
                onClick={() => setIsHelpModalOpen(true)}
                title={getTranslation('help.title', 'Help')}
              />

              {/* User Actions */}
              <UserActions
                onShowAuthModal={onShowAuthModal}
                onShowMiracleForm={onShowMiracleForm}
                onShowUserModal={() => {
                  setIsUserModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Essential mobile controls */}
              <MapControls
                zoomControls={zoomControls}
                getTranslation={getTranslation}
              />
              
              <IconButton
                icon={isMobileMenuOpen ? X : Menu}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              />
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
                  onShowAuthModal={onShowAuthModal}
                  onShowMiracleForm={onShowMiracleForm}
                  onShowUserModal={() => {
                    setIsUserModalOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        getTranslation={getTranslation}
        position="center"
      />

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </>
  )
}
