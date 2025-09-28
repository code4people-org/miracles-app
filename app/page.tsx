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
import PrayerRequestForm from '@/components/prayers/PrayerRequestForm'
import PrayerRequestDetails from '@/components/prayers/PrayerRequestDetails'
import Filters from '@/components/ui/Filters'
import AppHeader from '@/components/layout/AppHeader'
import WelcomeMessage from '@/components/layout/WelcomeMessage'
import FloatingActionButton from '@/components/layout/FloatingActionButton'
import HelpButton from '@/components/layout/HelpButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useMiracles } from '@/hooks/useMiracles'
import { usePrayerRequests } from '@/hooks/usePrayerRequests'
import type { Database } from '@/lib/supabase'
import { getDefaultMapType, type MapType } from '@/lib/mapTypes'
import type { LayerType } from '@/components/layout/LayerToggle'

type Miracle = Database['public']['Tables']['miracles']['Row']

// Temporary type definition for prayer requests until we regenerate Supabase types
type PrayerRequest = {
  id: string
  user_id: string
  title: string
  description: string
  category: 'health' | 'family' | 'work' | 'relationships' | 'spiritual_growth' | 'financial' | 'education' | 'peace' | 'grief' | 'other'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  location: string
  location_name: string | null
  privacy_level: 'public' | 'anonymous' | 'blurred_location'
  photo_url: string | null
  is_anonymous: boolean
  is_answered: boolean
  answered_at: string | null
  prayers_count: number
  comments_count: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

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
  
  const {
    filteredPrayerRequests,
    loading: prayerLoading,
    fetchPrayerRequests
  } = usePrayerRequests()

  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMiracleForm, setShowMiracleForm] = useState(false)
  const [showPrayerForm, setShowPrayerForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMiracle, setSelectedMiracle] = useState<Miracle | null>(null)
  const [selectedPrayerRequest, setSelectedPrayerRequest] = useState<PrayerRequest | null>(null)
  const [selectedMapType, setSelectedMapType] = useState<MapType>(getDefaultMapType())
  const [activeLayer, setActiveLayer] = useState<LayerType>('both')
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

  const handlePrayerSubmit = () => {
    setShowPrayerForm(false)
    fetchPrayerRequests() // Refresh the prayer requests list
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Header */}
      <AppHeader
        getTranslation={getTranslation}
        zoomControls={zoomControls}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onShowAuthModal={() => setShowAuthModal(true)}
        onShowMiracleForm={() => setShowMiracleForm(true)}
        onShowPrayerForm={() => setShowPrayerForm(true)}
        selectedMapType={selectedMapType}
        onMapTypeChange={setSelectedMapType}
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
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
          prayerRequests={filteredPrayerRequests}
          onMiracleSelect={setSelectedMiracle}
          onPrayerSelect={setSelectedPrayerRequest}
          loading={loading}
          prayerLoading={prayerLoading}
          selectedMapType={selectedMapType}
          activeLayer={activeLayer}
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

      <AnimatePresence>
        {showPrayerForm && (
          <PrayerRequestForm
            onClose={() => setShowPrayerForm(false)}
            onSubmit={handlePrayerSubmit}
            getTranslation={getTranslation}
          />
        )}
      </AnimatePresence>

      {/* Prayer Request Details Modal */}
      <AnimatePresence>
        {selectedPrayerRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-2xl">
              <PrayerRequestDetails
                prayerRequest={selectedPrayerRequest}
                onClose={() => setSelectedPrayerRequest(null)}
                onUpdate={() => {
                  fetchPrayerRequests()
                  setSelectedPrayerRequest(null)
                }}
              />
            </div>
          </div>
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