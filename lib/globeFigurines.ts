import type { MiracleCategory } from '@/lib/miracleCategories'
import type { PrayerCategory } from '@/lib/prayerCategories'

export type FigurineKind =
  | 'tree'
  | 'flowerGroup'
  | 'flowerBright'
  | 'flowerSingle'
  | 'fern'
  | 'bushFlowers'
  | 'bush'
  | 'clover'
  | 'mushroom'
  | 'orb'
  | 'lantern'

export interface FigurineSpec {
  kind: FigurineKind
  /** Path under /public, or null for procedural orb/lantern */
  modelUrl: string | null
  /** Uniform scale on the globe surface */
  scale: number
  /** Extra radial lift so models sit on the surface */
  altitude: number
}

const MODEL = {
  tree: '/models/CommonTree_1.glb',
  flowerGroup: '/models/Flower_3_Group.glb',
  flowerBright: '/models/Flower_4_Group.glb',
  flowerSingle: '/models/Flower_3_Single.glb',
  fern: '/models/Fern_1.glb',
  bushFlowers: '/models/Bush_Common_Flowers.glb',
  bush: '/models/Bush_Common.glb',
  clover: '/models/Clover_1.glb',
  mushroom: '/models/Mushroom_Common.glb',
} as const

const MIRACLE_MAP: Record<MiracleCategory, FigurineSpec> = {
  nature: { kind: 'tree', modelUrl: MODEL.tree, scale: 0.09, altitude: 0.035 },
  kindness: { kind: 'flowerGroup', modelUrl: MODEL.flowerGroup, scale: 0.1, altitude: 0.028 },
  health: { kind: 'fern', modelUrl: MODEL.fern, scale: 0.11, altitude: 0.028 },
  family: { kind: 'bushFlowers', modelUrl: MODEL.bushFlowers, scale: 0.1, altitude: 0.03 },
  friendship: { kind: 'bush', modelUrl: MODEL.bush, scale: 0.1, altitude: 0.03 },
  gratitude: { kind: 'flowerBright', modelUrl: MODEL.flowerBright, scale: 0.1, altitude: 0.028 },
  achievement: { kind: 'clover', modelUrl: MODEL.clover, scale: 0.11, altitude: 0.025 },
  discovery: { kind: 'mushroom', modelUrl: MODEL.mushroom, scale: 0.11, altitude: 0.025 },
  recovery: { kind: 'orb', modelUrl: null, scale: 0.08, altitude: 0.05 },
  other: { kind: 'orb', modelUrl: null, scale: 0.07, altitude: 0.05 },
}

const PRAYER_SPEC: FigurineSpec = {
  kind: 'lantern',
  modelUrl: null,
  scale: 0.07,
  altitude: 0.06,
}

export function getMiracleFigurine(category: MiracleCategory): FigurineSpec {
  return MIRACLE_MAP[category] ?? MIRACLE_MAP.other
}

export function getPrayerFigurine(_category?: PrayerCategory): FigurineSpec {
  void _category
  return PRAYER_SPEC
}

/** All GLB URLs to preload */
export const FIGURINE_MODEL_URLS: string[] = Object.values(MODEL)

export type GlobeItemType = 'miracle' | 'prayer'

export interface GlobeItem {
  id: string
  type: GlobeItemType
  lat: number
  lng: number
  category: string
  title: string
  createdAt: string
  spec: FigurineSpec
  /** Seed props for empty DB; clicks are ignored */
  isDemo?: boolean
}
