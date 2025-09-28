'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { parseLocation, createPrayerIcon, createPrayerPopup, type PrayerRequest } from '@/lib/mapUtils'

interface PrayerMarkersProps {
  map: L.Map | null
  prayerRequests: PrayerRequest[]
  onPrayerSelect: (prayerRequest: PrayerRequest) => void
}

export default function PrayerMarkers({ map, prayerRequests, onPrayerSelect }: PrayerMarkersProps) {
  const markersRef = useRef<L.Marker[]>([])

  // Memoize parsed locations to avoid recalculation
  const parsedPrayerRequests = useMemo(() => {
    return prayerRequests.map(prayerRequest => ({
      ...prayerRequest,
      position: parseLocation(prayerRequest.location)
    }))
  }, [prayerRequests])

  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    parsedPrayerRequests.forEach((prayerRequest) => {
      const customIcon = createPrayerIcon(prayerRequest.category, prayerRequest.urgency, prayerRequest.is_answered)
      const marker = L.marker([prayerRequest.position.lat, prayerRequest.position.lng], { icon: customIcon }).addTo(map)
      
      marker.bindPopup(createPrayerPopup(prayerRequest))
      marker.on('click', () => onPrayerSelect(prayerRequest))
      
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
  }, [map, parsedPrayerRequests, onPrayerSelect])

  return null
}
