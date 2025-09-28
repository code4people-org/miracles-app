'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence } from 'framer-motion'
import AuthModal from '@/components/auth/AuthModal'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import MiracleForm from '@/components/miracles/MiracleForm'
import MiracleDetails from '@/components/miracles/MiracleDetails'
import Filters from '@/components/ui/Filters'
import AppHeader from '@/components/layout/AppHeader'
import WelcomeMessage from '@/components/layout/WelcomeMessage'
import FloatingActionButton from '@/components/layout/FloatingActionButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useMiracles } from '@/hooks/useMiracles'
import type { Database } from '@/lib/supabase'

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
    <div className="h-screen bg-gradient-to-br from-miracle-warm via-white to-miracle-sky overflow-hidden">
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
      />

      {/* Main Content */}
      <main className="h-full pt-16">
        {/* World Map */}
        <div className="relative h-full">
          <DynamicLeafletMap
            miracles={filteredMiracles}
            onMiracleSelect={setSelectedMiracle}
            loading={loading}
            onZoomControlsReady={setZoomControls}
          />
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <div
              className="fixed left-4 top-20 z-30 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto"
              style={{
                animation: 'slideInLeft 0.3s ease-out'
              }}
            >
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Miracle Details Panel */}
        <AnimatePresence>
          {selectedMiracle && (
            <div
              className="fixed right-4 top-20 z-30 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto"
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
      </main>

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