import {
  getMiracleFigurine,
  getPrayerFigurine,
  type GlobeItem,
} from '@/lib/globeFigurines'
import type { MiracleCategory } from '@/lib/miracleCategories'

const NOW = '2026-01-01T00:00:00.000Z'

function miracleDemo(
  id: string,
  category: MiracleCategory,
  lat: number,
  lng: number,
  title: string
): GlobeItem {
  return {
    id: `demo-miracle-${id}`,
    type: 'miracle',
    lat,
    lng,
    category,
    title,
    createdAt: NOW,
    spec: getMiracleFigurine(category),
    isDemo: true,
  }
}

function prayerDemo(id: string, lat: number, lng: number, title: string): GlobeItem {
  return {
    id: `demo-prayer-${id}`,
    type: 'prayer',
    lat,
    lng,
    category: 'peace',
    title,
    createdAt: NOW,
    spec: getPrayerFigurine(),
    isDemo: true,
  }
}

/** Fixed candy sprinkle so an empty DB still looks alive. */
export const GLOBE_DEMO_SEED: GlobeItem[] = [
  miracleDemo('nyc', 'kindness', 40.7, -74.0, 'Demo: kindness in NYC'),
  miracleDemo('mexico', 'nature', 19.4, -99.1, 'Demo: nature near Mexico City'),
  miracleDemo('brazil', 'family', -23.5, -46.6, 'Demo: family in São Paulo'),
  miracleDemo('london', 'friendship', 51.5, -0.1, 'Demo: friendship in London'),
  miracleDemo('paris', 'gratitude', 48.9, 2.3, 'Demo: gratitude in Paris'),
  miracleDemo('nairobi', 'health', -1.3, 36.8, 'Demo: health in Nairobi'),
  miracleDemo('tokyo', 'achievement', 35.7, 139.7, 'Demo: achievement in Tokyo'),
  miracleDemo('sydney', 'discovery', -33.9, 151.2, 'Demo: discovery in Sydney'),
  miracleDemo('india', 'recovery', 28.6, 77.2, 'Demo: recovery in Delhi'),
  miracleDemo('alaska', 'other', 64.2, -149.5, 'Demo: a small wonder'),
  prayerDemo('lima', -12.0, -77.0, 'Demo: prayer light in Lima'),
  prayerDemo('cairo', 30.0, 31.2, 'Demo: prayer light in Cairo'),
]

export function getDemoSeedForLayer(
  activeLayer: 'miracles' | 'prayers' | 'both'
): GlobeItem[] {
  if (activeLayer === 'miracles') {
    return GLOBE_DEMO_SEED.filter((i) => i.type === 'miracle')
  }
  if (activeLayer === 'prayers') {
    return GLOBE_DEMO_SEED.filter((i) => i.type === 'prayer')
  }
  return GLOBE_DEMO_SEED
}
