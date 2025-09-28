'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, User, LogOut, Heart, MapPin, Filter, Search, ZoomIn, ZoomOut, Maximize, Globe } from 'lucide-react'
import AuthModal from '@/components/auth/AuthModal'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import MapSwitcher from '@/components/map/MapSwitcher'
import MiracleForm from '@/components/miracles/MiracleForm'
import MiracleDetails from '@/components/miracles/MiracleDetails'
import Filters from '@/components/ui/Filters'
import { supabase } from '@/lib/supabase'
import { getSampleMiracles } from '@/lib/sampleData'
import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function HomePage() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMiracleForm, setShowMiracleForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMiracle, setSelectedMiracle] = useState<Miracle | null>(null)
  const [miracles, setMiracles] = useState<Miracle[]>([])
  const [filteredMiracles, setFilteredMiracles] = useState<Miracle[]>([])
  const [loading, setLoading] = useState(true)
  const [mapType, setMapType] = useState<'leaflet'>('leaflet')
  const [filters, setFilters] = useState({
    category: '',
    timeRange: '',
    proximity: 0,
  })
  const [zoomControls, setZoomControls] = useState<{
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  } | null>(null)

  useEffect(() => {
    fetchMiracles()
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...miracles]

    if (filters.category) {
      filtered = filtered.filter(miracle => miracle.category === filters.category)
    }

    if (filters.timeRange) {
      const now = new Date()
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000,
      }
      
      const timeLimit = timeRanges[filters.timeRange as keyof typeof timeRanges]
      if (timeLimit) {
        filtered = filtered.filter(miracle => {
          const miracleDate = new Date(miracle.created_at)
          return now.getTime() - miracleDate.getTime() <= timeLimit
        })
      }
    }

    setFilteredMiracles(filtered)
  }, [miracles, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchMiracles = async () => {
    try {
      const { data, error } = await supabase
        .from('miracles')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // If no real miracles, use sample data for demonstration
      if (!data || data.length === 0) {
        setMiracles(getSampleMiracles())
      } else {
        setMiracles(data)
      }
    } catch (error) {
      console.error('Error fetching miracles:', error)
      // Fallback to sample data if there's an error
      setMiracles(getSampleMiracles())
    } finally {
      setLoading(false)
    }
  }


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
              <h1 className="text-xl font-bold gradient-text">Miracles</h1>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {/* Zoom Controls */}
              {zoomControls && (
                <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={zoomControls.zoomOut}
                    className="p-2 rounded-md hover:bg-miracle-gold/10 transition-colors duration-200"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-miracle-gold" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={zoomControls.zoomIn}
                    className="p-2 rounded-md hover:bg-miracle-gold/10 transition-colors duration-200"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-miracle-gold" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={zoomControls.fitBounds}
                    className="p-2 rounded-md hover:bg-miracle-gold/10 transition-colors duration-200"
                    title="Fit All Miracles"
                  >
                    <Maximize className="w-4 h-4 text-miracle-gold" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={zoomControls.worldView}
                    className="p-2 rounded-md hover:bg-miracle-gold/10 transition-colors duration-200"
                    title="Show Full World"
                  >
                    <Globe className="w-4 h-4 text-miracle-gold" />
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg bg-miracle-gold/10 hover:bg-miracle-gold/20 transition-colors duration-200"
              >
                <Filter className="w-5 h-5 text-miracle-gold" />
              </motion.button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMiracleForm(true)}
                    className="btn-miracle text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Share Miracle</span>
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-miracle-teal to-miracle-sky rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-600 hover:text-miracle-gold transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="btn-miracle text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Map Switcher */}
      <MapSwitcher
        mapType={mapType}
        onMapTypeChange={setMapType}
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
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed left-4 top-20 z-30 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Miracle Details Panel */}
        <AnimatePresence>
          {selectedMiracle && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-4 top-20 z-30 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              <MiracleDetails
                miracle={selectedMiracle}
                onClose={() => setSelectedMiracle(null)}
                onUpdate={fetchMiracles}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button for Mobile */}
        {user && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMiracleForm(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full shadow-lg flex items-center justify-center md:hidden"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        )}
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
      {!user && !showAuthModal && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 z-30 md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-miracle-gold/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                See and share the small miracles happening all around the world
              </h3>
              <p className="text-gray-600 mb-4">
                Join our community of positivity and inspiration
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="btn-miracle text-white px-6 py-2 rounded-lg font-semibold"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
