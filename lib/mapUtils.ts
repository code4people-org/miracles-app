import L from 'leaflet'
import type { Database } from '@/lib/supabase'
import { getCategoryColor, getCategoryEmoji, type MiracleCategory } from '@/lib/miracleCategories'

export type Miracle = Database['public']['Tables']['miracles']['Row']

// Convert PostGIS POINT to lat/lng
export function parseLocation(location: string): { lat: number; lng: number } {
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

// Create custom icon for miracle markers
export function createMiracleIcon(category: MiracleCategory): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        background: radial-gradient(circle, ${getCategoryColor(category)}, ${getCategoryColor(category)}88);
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
        ${getCategoryEmoji(category)}
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
}

// Create popup content for miracle markers
export function createMiraclePopup(miracle: Miracle): string {
  return `
    <div class="p-2">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-lg">${getCategoryEmoji(miracle.category)}</span>
        <h3 class="font-semibold text-gray-800">${miracle.title}</h3>
      </div>
      <p class="text-sm text-gray-600 mb-2">${miracle.description.substring(0, 100)}...</p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>${miracle.location_name}</span>
        <div class="flex items-center space-x-1">
          <span>❤️</span>
          <span>${miracle.upvotes_count}</span>
        </div>
      </div>
    </div>
  `
}

// Create zoom controls for map
export function createZoomControls(map: L.Map, miracles: Miracle[]) {
  return {
    zoomIn: () => {
      try {
        if (map && map.getContainer()) {
          map.zoomIn()
        }
      } catch (error) {
        console.warn('Map zoom in failed:', error)
      }
    },
    zoomOut: () => {
      try {
        if (map && map.getContainer()) {
          map.zoomOut()
        }
      } catch (error) {
        console.warn('Map zoom out failed:', error)
      }
    },
    fitBounds: () => {
      try {
        if (map && map.getContainer()) {
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
        }
      } catch (error) {
        console.warn('Map fit bounds failed:', error)
      }
    },
    worldView: () => {
      try {
        if (map && map.getContainer()) {
          map.setView([20, 0], 2)
        }
      } catch (error) {
        console.warn('Map world view failed:', error)
      }
    }
  }
}

// Create tile layer with consistent options
export function createTileLayer(url: string, attribution: string): L.TileLayer {
  return L.tileLayer(url, {
    attribution,
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  })
}

// Map configuration constants
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0] as [number, number],
  DEFAULT_ZOOM: 2,
  BOUNDS_PADDING: [20, 20] as [number, number]
} as const
