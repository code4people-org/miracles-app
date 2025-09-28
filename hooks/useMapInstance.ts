import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import type { MapType } from '@/lib/mapTypes'
import { createTileLayer, createZoomControls, type Miracle, type PrayerRequest, MAP_CONFIG } from '@/lib/mapUtils'

interface UseMapInstanceProps {
  selectedMapType: MapType
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayerRequest: PrayerRequest) => void
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
}

export function useMapInstance({ selectedMapType, miracles, prayerRequests, onMiracleSelect, onPrayerSelect, onZoomControlsReady }: UseMapInstanceProps) {
  const [isReady, setIsReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return

    try {
      // Create map instance directly with Leaflet - only once
      const map = L.map(mapRef.current, {
        center: MAP_CONFIG.DEFAULT_CENTER,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        minZoom: 2.0, // Prevent zooming out too much (1 = world view level)
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: L.latLngBounds(
          [-85, -180], // Southwest corner (southernmost latitude, westernmost longitude)
          [85, 180]    // Northeast corner (northernmost latitude, easternmost longitude)
        ),
        maxBoundsViscosity: 2.0, // Prevent any over-panning beyond bounds
        inertia: false // Disable inertia to prevent adjustment after mouse release
      })

      // Add initial tile layer
      const tileLayer = createTileLayer(selectedMapType.url, selectedMapType.attribution)
      tileLayer.addTo(map)

      // Set bounds after map creation to ensure proper behavior
      map.setMaxBounds(L.latLngBounds(
        [-85, -180], // Southwest corner
        [85, 180]    // Northeast corner
      ))

      mapInstanceRef.current = map
      isInitializedRef.current = true
      setIsReady(true)

      // Set up zoom controls immediately after map creation
      if (onZoomControlsReady) {
        const controls = createZoomControls(map, [...miracles, ...prayerRequests])
        onZoomControlsReady(controls)
      }

    } catch (error) {
      console.error('Error initializing map:', error)
      setIsReady(true)
    }
  }, []) // Only run once


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

  // Update zoom controls when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || !onZoomControlsReady) return

    const controls = createZoomControls(mapInstanceRef.current, [...miracles, ...prayerRequests])
    onZoomControlsReady(controls)
  }, [miracles, prayerRequests, onZoomControlsReady, isReady])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  return {
    mapRef,
    isReady,
    mapInstance: mapInstanceRef.current
  }
}