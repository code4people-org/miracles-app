export interface MapType {
  id: string
  name: string
  attribution: string
  url: string
  /** MapLibre vector style URL. When set, preferred over raster `url`. */
  styleUrl?: string
  icon: string
  description: string
}

const OSM_RASTER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const OPENFREEMAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const mapTypes: MapType[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    attribution: OSM_ATTRIBUTION,
    url: OSM_RASTER_URL,
    icon: '🗺️',
    description: 'Classic street map with detailed roads and landmarks'
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    attribution: OPENFREEMAP_ATTRIBUTION,
    url: OSM_RASTER_URL,
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    icon: '🌍',
    description: 'Clean, colorful map perfect for data visualization'
  },
  {
    id: 'carto-positron',
    name: 'Positron',
    attribution: OPENFREEMAP_ATTRIBUTION,
    url: OSM_RASTER_URL,
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
    icon: '⚪',
    description: 'Minimal light theme with subtle colors'
  },
  {
    id: 'carto-dark',
    name: 'Dark Matter',
    attribution: OPENFREEMAP_ATTRIBUTION,
    url: OSM_RASTER_URL,
    styleUrl: 'https://tiles.openfreemap.org/styles/dark',
    icon: '🌑',
    description: 'Dark theme for comfortable viewing in low light'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    icon: '🛰️',
    description: 'High-resolution satellite imagery'
  }
]

export const getMapTypeById = (id: string): MapType | undefined => {
  return mapTypes.find(mapType => mapType.id === id)
}

export const getDefaultMapType = (): MapType => {
  return mapTypes[1] // Voyager as default
}

// MapLibre uses raster source with tiles array. Convert Leaflet {s} subdomain format.
export function getMapLibreTiles(url: string): string[] {
  const subdomains = ['a', 'b', 'c']
  if (url.includes('{s}')) {
    return subdomains.map((s) => url.replace('{s}', s).replace('{r}', ''))
  }
  return [url.replace('{r}', '')]
}
