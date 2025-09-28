export interface MapType {
  id: string
  name: string
  attribution: string
  url: string
  icon: string
  description: string
}

export const mapTypes: MapType[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    icon: '🗺️',
    description: 'Classic street map with detailed roads and landmarks'
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    icon: '🌍',
    description: 'Clean, colorful map perfect for data visualization'
  },
  {
    id: 'carto-positron',
    name: 'Positron',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    icon: '⚪',
    description: 'Minimal light theme with subtle colors'
  },
  {
    id: 'carto-dark',
    name: 'Dark Matter',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
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
