'use client'

import React from 'react'
import { ZoomIn, ZoomOut, Maximize, Globe } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'

interface MapControlsProps {
  zoomControls: {
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  } | null
  getTranslation: (key: string, fallback: string) => string
}

export default function MapControls({ zoomControls, getTranslation }: MapControlsProps) {
  if (!zoomControls) return null

  return (
    <div className="flex items-center space-x-0.5 sm:space-x-1 bg-gray-100 rounded-lg p-0.5 sm:p-1">
      <IconButton
        icon={ZoomOut}
        onClick={zoomControls.zoomOut}
        title={getTranslation('map.zoomOut', 'Zoom Out')}
        size="sm"
        className="rounded-md"
      />
      <IconButton
        icon={ZoomIn}
        onClick={zoomControls.zoomIn}
        title={getTranslation('map.zoomIn', 'Zoom In')}
        size="sm"
        className="rounded-md"
      />
      <IconButton
        icon={Maximize}
        onClick={zoomControls.fitBounds}
        title={getTranslation('map.fitBounds', 'Fit All Miracles')}
        size="sm"
        className="rounded-md"
      />
      <IconButton
        icon={Globe}
        onClick={zoomControls.worldView}
        title={getTranslation('map.worldView', 'Show Full World')}
        size="sm"
        className="rounded-md"
      />
    </div>
  )
}
