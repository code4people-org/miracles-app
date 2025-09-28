import { useCallback, useRef } from 'react'
import { createZoomControls, type Miracle } from '@/lib/mapUtils'

interface UseZoomControlsProps {
  miracles: Miracle[]
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void }) => void
}

export function useZoomControls({ miracles, onZoomControlsReady }: UseZoomControlsProps) {
  const mapRef = useRef<L.Map | null>(null)
  const controlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; fitBounds: () => void; worldView: () => void } | null>(null)

  const setMapInstance = useCallback((map: L.Map) => {
    mapRef.current = map
    if (onZoomControlsReady) {
      const controls = createZoomControls(map, miracles)
      controlsRef.current = controls
      onZoomControlsReady(controls)
    }
  }, [miracles, onZoomControlsReady])

  const updateControls = useCallback(() => {
    if (mapRef.current && onZoomControlsReady) {
      const controls = createZoomControls(mapRef.current, miracles)
      controlsRef.current = controls
      onZoomControlsReady(controls)
    }
  }, [miracles, onZoomControlsReady])

  return {
    setMapInstance,
    updateControls,
    controls: controlsRef.current
  }
}
