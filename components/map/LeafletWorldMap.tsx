'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import { MapPin, Heart } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Database } from '@/lib/supabase'

type Miracle = Database['public']['Tables']['miracles']['Row']

interface LeafletWorldMapProps {
  miracles: Miracle[]
  onMiracleSelect: (miracle: Miracle) => void
  loading: boolean
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
}

// Convert PostGIS POINT to lat/lng
function parseLocation(location: string): { lat: number; lng: number } {
  // Handle both formats: POINT(lng lat) and (lng,lat)
  const pointMatch = location.match(/POINT\(([^)]+)\)/)
  const coordMatch = location.match(/\(([^)]+)\)/)
  
  if (pointMatch) {
    // Old format: POINT(lng lat)
    const [lng, lat] = pointMatch[1].split(' ').map(Number)
    return { lat, lng }
  } else if (coordMatch) {
    // New format: (lng,lat)
    const [lng, lat] = coordMatch[1].split(',').map(Number)
    return { lat, lng }
  }
  return { lat: 0, lng: 0 }
}

// Custom miracle marker component
function MiracleMarker({ miracle, onSelect }: { miracle: Miracle, onSelect: () => void }) {
  const { lat, lng } = parseLocation(miracle.location)
  
  const getCategoryColor = (category: string) => {
    const colors = {
      kindness: '#FFD700',
      nature: '#98FB98',
      health: '#87CEEB',
      family: '#FF7F50',
      friendship: '#20B2AA',
      achievement: '#DDA0DD',
      recovery: '#F0E68C',
      discovery: '#FFB6C1',
      gratitude: '#FFA07A',
      other: '#D3D3D3'
    }
    return colors[category as keyof typeof colors] || '#D3D3D3'
  }

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      kindness: '🤝',
      nature: '🌱',
      health: '💚',
      family: '👨‍👩‍👧‍👦',
      friendship: '👫',
      achievement: '🏆',
      recovery: '🌅',
      discovery: '🔍',
      gratitude: '🙏',
      other: '✨'
    }
    return emojis[category as keyof typeof emojis] || '✨'
  }

  // Create custom icon
  const customIcon = L.divIcon({
    html: `
      <div style="
        background: radial-gradient(circle, ${getCategoryColor(miracle.category)}, ${getCategoryColor(miracle.category)}88);
        border: 3px solid white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
        ${getCategoryEmoji(miracle.category)}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
          50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
          100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        }
      </style>
    `,
    className: 'custom-miracle-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })

  return (
    <Marker 
      position={[lat, lng]} 
      icon={customIcon}
      eventHandlers={{
        click: onSelect
      }}
    >
      <Popup>
        <div className="p-2">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getCategoryEmoji(miracle.category)}</span>
            <h3 className="font-semibold text-gray-800">{miracle.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{miracle.description.substring(0, 100)}...</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{miracle.location_name}</span>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{miracle.upvotes_count}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Component to fit map bounds to show all miracles
function FitBounds({ miracles }: { miracles: Miracle[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (miracles.length > 0) {
      const bounds = L.latLngBounds(
        miracles.map(miracle => {
          const { lat, lng } = parseLocation(miracle.location)
          return [lat, lng]
        })
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    } else {
      // Default to world view
      map.setView([20, 0], 2)
    }
  }, [map, miracles])

  return null
}

// Component to expose zoom controls to parent
function ZoomControls({ miracles, onZoomControlsReady }: { miracles: Miracle[], onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (onZoomControlsReady) {
      const controls = {
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        fitBounds: () => {
          if (miracles.length > 0) {
            const bounds = L.latLngBounds(
              miracles.map(miracle => {
                const { lat, lng } = parseLocation(miracle.location)
                return [lat, lng]
              })
            )
            map.fitBounds(bounds, { padding: [20, 20] })
          } else {
            map.setView([20, 0], 2)
          }
        },
        worldView: () => map.setView([20, 0], 2)
      }
      onZoomControlsReady(controls)
    }
  }, [map, miracles, onZoomControlsReady])

  return null
}

export default function LeafletWorldMap({ miracles, onMiracleSelect, loading, onZoomControlsReady }: LeafletWorldMapProps) {
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

  return (
    <div className="relative w-full h-full">
      {/* Leaflet Map */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Alternative beautiful tile layers */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <FitBounds miracles={miracles} />
        <ZoomControls miracles={miracles} onZoomControlsReady={onZoomControlsReady} />
        
        {miracles.map((miracle) => (
          <MiracleMarker
            key={miracle.id}
            miracle={miracle}
            onSelect={() => onMiracleSelect(miracle)}
          />
        ))}
      </MapContainer>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Loading overlay */}
        {loading && (
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

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-miracle-gold/20 pointer-events-auto"
        >
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-miracle-gold" />
            Miracle Categories
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-miracle-gold mr-2"></div>
              <span className="text-gray-800">🤝 Kindness</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-miracle-green mr-2"></div>
              <span className="text-gray-800">🌱 Nature</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-miracle-sky mr-2"></div>
              <span className="text-gray-800">💚 Health</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-miracle-coral mr-2"></div>
              <span className="text-gray-800">👨‍👩‍👧‍👦 Family</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-miracle-teal mr-2"></div>
              <span className="text-gray-800">👫 Friendship</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-miracle-gold/20 pointer-events-auto"
        >
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-miracle-gold" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{miracles.length}</p>
              <p className="text-sm text-gray-600">Miracles Shared</p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute top-20 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-miracle-gold/20 max-w-xs pointer-events-auto"
        >
          <h3 className="font-semibold text-gray-800 mb-2">How to Explore</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Drag to pan around the world</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Click on miracle markers to read stories</li>
            <li>• Use filters to find specific types</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
