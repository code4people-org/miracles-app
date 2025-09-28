'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import type { MapType } from '@/lib/mapTypes'

// Dynamically import the Leaflet map to avoid SSR issues
const LeafletWorldMap = dynamic(() => import('./LeafletWorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-miracle-sky to-miracle-teal flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-miracle-gold to-miracle-coral rounded-full mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-white font-semibold">Loading the world of miracles...</p>
      </motion.div>
    </div>
  )
})

interface DynamicLeafletMapProps {
  miracles: any[]
  onMiracleSelect: (miracle: any) => void
  loading: boolean
  selectedMapType: MapType
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
  getTranslation: (key: string, fallback: string) => string
}

export default function DynamicLeafletMap({ miracles, onMiracleSelect, loading, selectedMapType, onZoomControlsReady, getTranslation }: DynamicLeafletMapProps) {
  return (
    <LeafletWorldMap
      miracles={miracles}
      onMiracleSelect={onMiracleSelect}
      loading={loading}
      selectedMapType={selectedMapType}
      onZoomControlsReady={onZoomControlsReady}
      getTranslation={getTranslation}
    />
  )
}
