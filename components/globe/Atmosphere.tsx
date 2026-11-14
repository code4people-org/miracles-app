'use client'

import React from 'react'
import { BackSide } from 'three'
import { GLOBE_RADIUS } from '@/lib/globeMath'

/** Thin fresnel-like shell for a soft candy glow */
export default function Atmosphere() {
  return (
    <mesh scale={1.06}>
      <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
      <meshBasicMaterial
        color="#ffd4a8"
        transparent
        opacity={0.18}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
