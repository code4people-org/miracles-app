'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence } from 'framer-motion'
import AuthModal from '@/components/auth/AuthModal'
import dynamic from 'next/dynamic'

// Dynamically import the Leaflet map to avoid SSR issues
const LeafletWorldMap = dynamic(() => import('@/components/map/LeafletWorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-miracle-sky to-miracle-teal flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-white font-semibold">Loading the world of miracles...</p>
      </div>
    </div>
  )
})
import MiracleForm from '@/components/miracles/MiracleForm'
import MiracleDetails from '@/components/miracles/MiracleDetails'
import Filters from '@/components/ui/Filters'
import AppHeader from '@/components/layout/AppHeader'
import WelcomeMessage from '@/components/layout/WelcomeMessage'
import FloatingActionButton from '@/components/layout/FloatingActionButton'
import HelpButton from '@/components/layout/HelpButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useMiracles } from '@/hooks/useMiracles'
import type { Database } from '@/lib/supabase'
import { getDefaultMapType, type MapType } from '@/lib/mapTypes'

type Miracle = Database['public']['Tables']['miracles']['Row']

export default function HomePage() {
  const { user, signOut } = useAuth()
  const { getTranslation } = useTranslation()
  const { 
    filteredMiracles, 
    loading, 
    filters, 
    setFilters, 
    fetchMiracles 
  } = useMiracles()

  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMiracleForm, setShowMiracleForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMiracle, setSelectedMiracle] = useState<Miracle | null>(null)
  const [selectedMapType, setSelectedMapType] = useState<MapType>(getDefaultMapType())
  const [zoomControls, setZoomControls] = useState<{
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  } | null>(null)

  // Event Handlers
  const handleSignOut = async () => {
    await signOut()
  }

  const handleMiracleSubmit = () => {
    setShowMiracleForm(false)
    fetchMiracles() // Refresh the miracles list
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Header */}
      <AppHeader
        getTranslation={getTranslation}
        zoomControls={zoomControls}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        user={user}
        onSignOut={handleSignOut}
        onShowAuthModal={() => setShowAuthModal(true)}
        onShowMiracleForm={() => setShowMiracleForm(true)}
        selectedMapType={selectedMapType}
        onMapTypeChange={setSelectedMapType}
      />

      {/* World Map */}
      <div 
        className="absolute left-0 right-0 map-responsive" 
        style={{ 
          top: '3.5rem',
          height: 'calc(100vh - 3.5rem)',
          margin: 0, 
          padding: 0 
        }}
      >
        <LeafletWorldMap
          miracles={filteredMiracles}
          onMiracleSelect={setSelectedMiracle}
          loading={loading}
          selectedMapType={selectedMapType}
          onZoomControlsReady={setZoomControls}
          getTranslation={getTranslation}
        />
      </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <div
              className="fixed left-2 right-2 top-16 sm:top-20 z-30 sm:left-4 sm:right-auto sm:w-80 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto"
              style={{
                animation: 'slideInLeft 0.3s ease-out'
              }}
            >
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
                getTranslation={getTranslation}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Miracle Details Panel */}
        <AnimatePresence>
          {selectedMiracle && (
            <div
              className="fixed left-2 right-2 top-16 sm:top-20 z-30 sm:left-auto sm:right-4 sm:w-96 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto"
              style={{
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <MiracleDetails
                miracle={selectedMiracle}
                onClose={() => setSelectedMiracle(null)}
                onUpdate={fetchMiracles}
              />
            </div>
          )}
        </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        user={user}
        onShowMiracleForm={() => setShowMiracleForm(true)}
      />

      {/* Help Button - Mobile */}
      <HelpButton getTranslation={getTranslation} />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />

      <AnimatePresence>
        {showMiracleForm && (
          <MiracleForm
            onClose={() => setShowMiracleForm(false)}
            onSubmit={handleMiracleSubmit}
            getTranslation={getTranslation}
          />
        )}
      </AnimatePresence>

      {/* Welcome Message for New Users */}
      <WelcomeMessage
        user={user}
        showAuthModal={showAuthModal}
        onShowAuthModal={() => setShowAuthModal(true)}
        getTranslation={getTranslation}
      />
    </div>
  )
}