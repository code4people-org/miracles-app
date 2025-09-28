'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Hand } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapType } from '@/lib/mapTypes'
import { type Miracle, type PrayerRequest } from '@/lib/mapUtils'
import { useMapInstance } from '@/hooks/useMapInstance'
import MiracleCategoriesLegend from './MiracleCategoriesLegend'
import MiracleMarkers from './MiracleMarkers'
import PrayerMarkers from './PrayerMarkers'
import TileLayer from './TileLayer'
import type { LayerType } from '@/components/layout/LayerToggle'

interface LeafletWorldMapProps {
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayerRequest: PrayerRequest) => void
  loading: boolean
  prayerLoading: boolean
  selectedMapType: MapType
  activeLayer: LayerType
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
  getTranslation: (key: string, fallback: string) => string
}

export default function LeafletWorldMap({ 
  selectedMapType, 
  miracles, 
  prayerRequests,
  onMiracleSelect, 
  onPrayerSelect,
  onZoomControlsReady, 
  getTranslation,
  activeLayer 
}: LeafletWorldMapProps) {
  const { mapRef, isReady, mapInstance } = useMapInstance({
    selectedMapType,
    miracles,
    prayerRequests,
    onMiracleSelect,
    onPrayerSelect,
    onZoomControlsReady
  })

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          height: '100%', 
          width: '100%', 
          margin: 0, 
          padding: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent'
        }}
      />

      {/* Map Components */}
      {isReady && mapInstance && (
        <>
          <TileLayer map={mapInstance} mapType={selectedMapType} />
          {(activeLayer === 'miracles' || activeLayer === 'both') && (
            <MiracleMarkers 
              map={mapInstance} 
              miracles={miracles} 
              onMiracleSelect={onMiracleSelect} 
            />
          )}
          {(activeLayer === 'prayers' || activeLayer === 'both') && (
            <PrayerMarkers 
              map={mapInstance} 
              prayerRequests={prayerRequests} 
              onPrayerSelect={onPrayerSelect} 
            />
          )}
        </>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Loading overlay */}
        {!isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Discovering miracles around the world...</p>
            </div>
          </motion.div>
        )}

        {/* Miracle Categories Legend */}
        <MiracleCategoriesLegend getTranslation={getTranslation} />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-miracle-gold/20 pointer-events-auto z-10"
        >
          <div className="space-y-3">
            {(activeLayer === 'miracles' || activeLayer === 'both') && (
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-miracle-gold" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">{miracles.length}</p>
                  <p className="text-sm text-gray-600">{getTranslation('map.miraclesShared', 'Miracles Shared')}</p>
                </div>
              </div>
            )}
            {(activeLayer === 'prayers' || activeLayer === 'both') && (
              <div className="flex items-center space-x-2">
                <Hand className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">{prayerRequests.length}</p>
                  <p className="text-sm text-gray-600">{getTranslation('prayers.title', 'Prayer Requests')}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
