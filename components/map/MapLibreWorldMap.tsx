'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Hand } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapType } from '@/lib/mapTypes'
import { type Miracle, type PrayerRequest, createMiraclePopup, createPrayerPopup } from '@/lib/mapUtils'
import {
  createMapLibreStyle,
  createMapLibreZoomControls,
  createMiracleMarkerElement,
  createPrayerMarkerElement,
  MAPLIBRE_CONFIG
} from '@/lib/maplibreUtils'
import MiracleCategoriesLegend from './MiracleCategoriesLegend'
import type { LayerType } from '@/components/layout/LayerToggle'

interface MapLibreWorldMapProps {
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayerRequest: PrayerRequest) => void
  onMapClick?: (location: { lat: number; lng: number }) => void
  loading: boolean
  prayerLoading: boolean
  selectedMapType: MapType
  activeLayer: LayerType
  onZoomControlsReady?: (controls: {
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  }) => void
  getTranslation: (key: string, fallback: string) => string
}

export default function MapLibreWorldMap({
  selectedMapType,
  miracles,
  prayerRequests,
  onMiracleSelect,
  onPrayerSelect,
  onMapClick,
  onZoomControlsReady,
  getTranslation,
  activeLayer
}: MapLibreWorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [isReady, setIsReady] = useState(false)

  // Init map (run once; style/zoom/markers updated in other effects)
  useEffect(() => {
    if (!mapRef.current) return

    const style = createMapLibreStyle(selectedMapType)
    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: MAPLIBRE_CONFIG.DEFAULT_CENTER,
      zoom: MAPLIBRE_CONFIG.DEFAULT_ZOOM,
      minZoom: MAPLIBRE_CONFIG.MIN_ZOOM,
      maxZoom: MAPLIBRE_CONFIG.MAX_ZOOM,
      attributionControl: false
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.GlobeControl(), 'top-right')

    map.on('load', () => {
      mapInstanceRef.current = map
      setIsReady(true)
      if (onZoomControlsReady) {
        onZoomControlsReady(
          createMapLibreZoomControls(map, [...miracles, ...prayerRequests])
        )
      }
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
        })
      }
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; style/zoom/markers in other effects
  }, [])

  // Update tile style when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    const style = createMapLibreStyle(selectedMapType)
    map.setStyle(style)
  }, [selectedMapType, isReady])

  // Update zoom controls when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || !onZoomControlsReady) return
    onZoomControlsReady(
      createMapLibreZoomControls(mapInstanceRef.current, [
        ...miracles,
        ...prayerRequests
      ])
    )
  }, [miracles, prayerRequests, onZoomControlsReady, isReady])

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const addMarker = (
      lng: number,
      lat: number,
      el: HTMLElement,
      popupHtml: string,
      onClick: () => void
    ) => {
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map)
      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(popupHtml)
      marker.setPopup(popup)
      el.addEventListener('click', onClick)
      markersRef.current.push(marker)
    }

    const parseLoc = (loc: string) => {
      const m = loc.match(/POINT\(([^)]+)\)/) || loc.match(/\(([^)]+)\)/)
      if (m) {
        const [lng, lat] = m[1].split(/[\s,]+/).map(Number)
        return { lat, lng }
      }
      return { lat: 0, lng: 0 }
    }

    if (activeLayer === 'miracles' || activeLayer === 'both') {
      miracles.forEach((miracle) => {
        const { lat, lng } = parseLoc(miracle.location)
        const el = createMiracleMarkerElement(miracle.category)
        addMarker(
          lng,
          lat,
          el,
          createMiraclePopup(miracle),
          () => onMiracleSelect(miracle)
        )
      })
    }

    if (activeLayer === 'prayers' || activeLayer === 'both') {
      prayerRequests.forEach((pr) => {
        const { lat, lng } = parseLoc(pr.location)
        const el = createPrayerMarkerElement(pr.category, pr.urgency, pr.is_answered)
        addMarker(
          lng,
          lat,
          el,
          createPrayerPopup(pr),
          () => onPrayerSelect(pr)
        )
      })
    }

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [isReady, miracles, prayerRequests, activeLayer, onMiracleSelect, onPrayerSelect])

  return (
    <div className="relative w-full h-full">
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

      <div className="absolute inset-0 pointer-events-none">
        {!isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">
                Discovering miracles around the world...
              </p>
            </div>
          </motion.div>
        )}

        <MiracleCategoriesLegend getTranslation={getTranslation} />

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
                  <p className="text-sm text-gray-600">
                    {getTranslation('map.miraclesShared', 'Good Things Shared')}
                  </p>
                </div>
              </div>
            )}
            {(activeLayer === 'prayers' || activeLayer === 'both') && (
              <div className="flex items-center space-x-2">
                <Hand className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {prayerRequests.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getTranslation('prayers.title', 'Help')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
