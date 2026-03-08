import type { Map as MapLibreMap } from 'maplibre-gl'
import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec'
import { getMapLibreTiles } from '@/lib/mapTypes'
import { parseLocation, type Miracle, type PrayerRequest } from '@/lib/mapUtils'
import { getCategoryColor, getCategoryEmoji, type MiracleCategory } from '@/lib/miracleCategories'
import {
  getPrayerCategoryEmoji,
  getPrayerUrgencyColor,
  getPrayerUrgencyEmoji,
  type PrayerCategory,
  type PrayerUrgency
} from '@/lib/prayerCategories'
import type { MapType } from '@/lib/mapTypes'

export const MAPLIBRE_CONFIG = {
  DEFAULT_CENTER: [0, 20] as [number, number], // [lng, lat] for MapLibre
  DEFAULT_ZOOM: 2,
  MIN_ZOOM: 2,
  MAX_ZOOM: 19
} as const

export function createMapLibreStyle(mapType: MapType): StyleSpecification {
  const tiles = getMapLibreTiles(mapType.url)
  return {
    version: 8,
    projection: { type: 'globe' },
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles,
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'raster-layer',
        type: 'raster',
        source: 'raster-tiles'
      }
    ]
  } as StyleSpecification
}

export function createMapLibreZoomControls(
  map: MapLibreMap | null,
  items: (Miracle | PrayerRequest)[]
) {
  return {
    zoomIn: () => {
      try {
        if (map) map.zoomIn()
      } catch (e) {
        console.warn('MapLibre zoom in failed:', e)
      }
    },
    zoomOut: () => {
      try {
        if (map) map.zoomOut()
      } catch (e) {
        console.warn('MapLibre zoom out failed:', e)
      }
    },
    fitBounds: () => {
      try {
        if (!map) return
        if (items.length > 0) {
          const lnglats = items.map((item) => {
            const { lat, lng } = parseLocation(item.location)
            return [lng, lat] as [number, number]
          })
          const lngs = lnglats.map(([lng]) => lng)
          const lats = lnglats.map(([, lat]) => lat)
          map.fitBounds(
            [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)]
            ],
            { padding: 20 }
          )
        } else {
          map.flyTo({ center: [0, 20], zoom: 2 })
        }
      } catch (e) {
        console.warn('MapLibre fit bounds failed:', e)
      }
    },
    worldView: () => {
      try {
        if (map) map.flyTo({ center: [0, 20], zoom: 2 })
      } catch (e) {
        console.warn('MapLibre world view failed:', e)
      }
    }
  }
}

export function createMiracleMarkerElement(category: MiracleCategory): HTMLElement {
  const el = document.createElement('div')
  el.className = 'maplibre-marker maplibre-marker-miracle'
  el.style.cursor = 'pointer'
  el.innerHTML = `
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
    ">${getCategoryEmoji(category)}</div>
  `
  return el
}

export function createPrayerMarkerElement(
  category: PrayerCategory,
  urgency: PrayerUrgency,
  isAnswered: boolean
): HTMLElement {
  const urgencyColor = getPrayerUrgencyColor(urgency)
  const categoryEmoji = getPrayerCategoryEmoji(category)
  const iconColor = isAnswered ? '#6B7280' : urgencyColor
  const borderColor = isAnswered ? '#9CA3AF' : '#FFFFFF'
  const el = document.createElement('div')
  el.className = 'maplibre-marker maplibre-marker-prayer'
  el.style.cursor = 'pointer'
  el.innerHTML = `
    <div style="
      background: radial-gradient(circle, ${iconColor}, ${iconColor}88);
      border: 3px solid ${borderColor};
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
    ">${isAnswered ? '✅' : categoryEmoji}</div>
  `
  return el
}
