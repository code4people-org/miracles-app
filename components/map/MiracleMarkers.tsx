'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { parseLocation, createMiracleIcon, createMiraclePopup, type Miracle } from '@/lib/mapUtils'

interface MiracleMarkersProps {
  map: L.Map | null
  miracles: Miracle[]
  onMiracleSelect: (miracle: Miracle) => void
}

export default function MiracleMarkers({ map, miracles, onMiracleSelect }: MiracleMarkersProps) {
  const markersRef = useRef<L.Marker[]>([])

  // Memoize parsed locations to avoid recalculation
  const parsedMiracles = useMemo(() => {
    return miracles.map(miracle => ({
      ...miracle,
      position: parseLocation(miracle.location)
    }))
  }, [miracles])

  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    parsedMiracles.forEach((miracle) => {
      const customIcon = createMiracleIcon(miracle.category)
      const marker = L.marker([miracle.position.lat, miracle.position.lng], { icon: customIcon }).addTo(map)
      
      marker.bindPopup(createMiraclePopup(miracle))
      marker.on('click', () => onMiracleSelect(miracle))
      
      markersRef.current.push(marker)
    })

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker)
        }
      })
      markersRef.current = []
    }
  }, [map, parsedMiracles, onMiracleSelect])

  return null
}
