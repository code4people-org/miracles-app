'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapType } from '@/lib/mapTypes'
import { type Miracle } from '@/lib/mapUtils'
import { useMapInstance } from '@/hooks/useMapInstance'
import MiracleCategoriesLegend from './MiracleCategoriesLegend'
import MiracleMarkers from './MiracleMarkers'
import TileLayer from './TileLayer'

interface LeafletWorldMapProps {
  miracles: Miracle[]
  onMiracleSelect: (miracle: Miracle) => void
  loading: boolean
  selectedMapType: MapType
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
  getTranslation: (key: string, fallback: string) => string
}

// Optimized map container component
function SafeMapContainer({ selectedMapType, miracles, onMiracleSelect, onZoomControlsReady, getTranslation }: LeafletWorldMapProps) {
  const { mapRef, isReady, mapInstance } = useMapInstance({
    selectedMapType,
    miracles,
    onMiracleSelect,
    onZoomControlsReady
  })

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Map Components */}
      {isReady && mapInstance && (
        <>
          <TileLayer map={mapInstance} mapType={selectedMapType} />
          <MiracleMarkers 
            map={mapInstance} 
            miracles={miracles} 
            onMiracleSelect={onMiracleSelect} 
          />
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
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-miracle-gold" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{miracles.length}</p>
              <p className="text-sm text-gray-600">{getTranslation('map.miraclesShared', 'Miracles Shared')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LeafletWorldMap(props: LeafletWorldMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-miracle-sky to-miracle-teal flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading the world of miracles...</p>
        </div>
      </div>
    )
  }

  return <SafeMapContainer {...props} />
}
