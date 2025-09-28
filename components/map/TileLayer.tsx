'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { createTileLayer } from '@/lib/mapUtils'
import type { MapType } from '@/lib/mapTypes'

interface TileLayerProps {
  map: L.Map | null
  mapType: MapType
}

export default function TileLayer({ map, mapType }: TileLayerProps) {
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    if (!map) return

    // Remove existing tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    // Add new tile layer
    const tileLayer = createTileLayer(mapType.url, mapType.attribution)
    tileLayer.addTo(map)
    tileLayerRef.current = tileLayer

    // Cleanup function
    return () => {
      if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
        map.removeLayer(tileLayerRef.current)
      }
    }
  }, [map, mapType.url, mapType.attribution])

  return null
}
