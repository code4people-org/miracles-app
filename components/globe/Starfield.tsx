'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'

/** WebGPU-safe star points (no ShaderMaterial / drei Stars). */
export default function Starfield({ count = 1200, radius = 40 }: { count?: number; radius?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * (0.75 + Math.random() * 0.25)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count, radius])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#ffffff"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}
