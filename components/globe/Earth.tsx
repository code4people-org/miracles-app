'use client'

import React from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBE_RADIUS } from '@/lib/globeMath'

/**
 * Candy pastel Earth: uses the land/ocean map only as a soft shape guide,
 * then heavily recolors so it no longer reads as satellite imagery.
 */
export default function Earth() {
  const texture = useLoader(THREE.TextureLoader, '/textures/earth.jpg')
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  return (
    <group>
      {/* Soft land silhouette under pastel tint */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color="#c8f0a8"
          roughness={0.95}
          metalness={0}
          emissive="#fff0d6"
          emissiveIntensity={0.22}
          flatShading={false}
        />
      </mesh>
      {/* Candy ocean wash */}
      <mesh scale={1.001}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#7EC8E3"
          transparent
          opacity={0.42}
          roughness={0.55}
          metalness={0.05}
          emissive="#a8e0f5"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Warm candy glaze */}
      <mesh scale={1.004}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#ffe8c8"
          transparent
          opacity={0.12}
          roughness={0.8}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
