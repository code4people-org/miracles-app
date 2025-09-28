import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import type { MapType } from '@/lib/mapTypes'
import { createTileLayer, createZoomControls, parseLocation, createMiracleIcon, createMiraclePopup, type Miracle, MAP_CONFIG } from '@/lib/mapUtils'

interface UseMapInstanceProps {
  selectedMapType: MapType
  miracles: Miracle[]
  onMiracleSelect: (miracle: Miracle) => void
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
}

export function useMapInstance({ selectedMapType, miracles, onMiracleSelect, onZoomControlsReady }: UseMapInstanceProps) {
  const [isReady, setIsReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const isInitializedRef = useRef(false)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return

    try {
      // Create map instance directly with Leaflet - only once
      const map = L.map(mapRef.current, {
        center: MAP_CONFIG.DEFAULT_CENTER,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        zoomControl: false
      })

      // Add initial tile layer
      const tileLayer = createTileLayer(selectedMapType.url, selectedMapType.attribution)
      tileLayer.addTo(map)

      mapInstanceRef.current = map
      isInitializedRef.current = true
      setIsReady(true)

      // Set up zoom controls immediately after map creation
      if (onZoomControlsReady) {
        const controls = createZoomControls(map, miracles)
        onZoomControlsReady(controls)
      }

    } catch (error) {
      console.error('Error initializing map:', error)
      setIsReady(true)
    }
  }, []) // Only run once

  // Update markers when miracles change
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current!.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    miracles.forEach((miracle) => {
      const { lat, lng } = parseLocation(miracle.location)
      const customIcon = createMiracleIcon(miracle.category)
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current!)
      
      marker.bindPopup(createMiraclePopup(miracle))
      marker.on('click', () => onMiracleSelect(miracle))
      
      markersRef.current.push(marker)
    })
  }, [miracles, onMiracleSelect, isReady])

  // Update tile layer when map type changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return

    // Remove existing tile layers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current!.removeLayer(layer)
      }
    })

    // Add new tile layer
    const tileLayer = createTileLayer(selectedMapType.url, selectedMapType.attribution)
    tileLayer.addTo(mapInstanceRef.current)
  }, [selectedMapType.url, selectedMapType.attribution, isReady])

  // Update zoom controls when miracles change
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || !onZoomControlsReady) return

    const controls = createZoomControls(mapInstanceRef.current, miracles)
    onZoomControlsReady(controls)
  }, [miracles, onZoomControlsReady, isReady])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        isInitializedRef.current = false
        markersRef.current = []
      }
    }
  }, [])

  return {
    mapRef,
    isReady,
    mapInstance: mapInstanceRef.current
  }
}