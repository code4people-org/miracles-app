// Common utility functions for detail components

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const parseLocation = (location: string) => {
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
