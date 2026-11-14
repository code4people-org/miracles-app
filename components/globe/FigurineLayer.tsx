'use client'

import React, { useMemo } from 'react'
import { parseLocation, type Miracle, type PrayerRequest } from '@/lib/mapUtils'
import {
  FIGURINE_MODEL_URLS,
  getMiracleFigurine,
  getPrayerFigurine,
  type GlobeItem,
} from '@/lib/globeFigurines'
import { getDemoSeedForLayer } from '@/lib/globeDemoSeed'
import type { MiracleCategory } from '@/lib/miracleCategories'
import type { LayerType } from '@/components/layout/LayerToggle'
import Figurine, { preloadFigurineModels } from './Figurine'

preloadFigurineModels(FIGURINE_MODEL_URLS)

interface FigurineLayerProps {
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  activeLayer: LayerType
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayer: PrayerRequest) => void
}

export default function FigurineLayer({
  miracles,
  prayerRequests,
  activeLayer,
  onMiracleSelect,
  onPrayerSelect,
}: FigurineLayerProps) {
  const items = useMemo(() => {
    const result: GlobeItem[] = []

    if (activeLayer === 'miracles' || activeLayer === 'both') {
      for (const m of miracles) {
        const { lat, lng } = parseLocation(m.location)
        result.push({
          id: `miracle-${m.id}`,
          type: 'miracle',
          lat,
          lng,
          category: m.category,
          title: m.title,
          createdAt: m.created_at,
          spec: getMiracleFigurine(m.category as MiracleCategory),
        })
      }
    }

    if (activeLayer === 'prayers' || activeLayer === 'both') {
      for (const p of prayerRequests) {
        const { lat, lng } = parseLocation(p.location)
        result.push({
          id: `prayer-${p.id}`,
          type: 'prayer',
          lat,
          lng,
          category: p.category,
          title: p.title,
          createdAt: p.created_at,
          spec: getPrayerFigurine(),
        })
      }
    }

    // Empty world: show candy demo sprinkle (respects active layer)
    if (result.length === 0) {
      return getDemoSeedForLayer(activeLayer)
    }

    return result
  }, [miracles, prayerRequests, activeLayer])

  const miracleById = useMemo(() => {
    const map = new Map<string, Miracle>()
    miracles.forEach((m) => map.set(m.id, m))
    return map
  }, [miracles])

  const prayerById = useMemo(() => {
    const map = new Map<string, PrayerRequest>()
    prayerRequests.forEach((p) => map.set(p.id, p))
    return map
  }, [prayerRequests])

  const handleSelect = (item: GlobeItem) => {
    if (item.isDemo) return

    if (item.type === 'miracle') {
      const id = item.id.replace(/^miracle-/, '')
      const miracle = miracleById.get(id)
      if (miracle) onMiracleSelect(miracle)
    } else {
      const id = item.id.replace(/^prayer-/, '')
      const prayer = prayerById.get(id)
      if (prayer) onPrayerSelect(prayer)
    }
  }

  return (
    <group>
      {items.map((item) => (
        <Figurine key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </group>
  )
}
