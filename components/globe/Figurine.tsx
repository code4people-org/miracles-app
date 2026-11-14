'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Clone } from '@react-three/drei'
import * as THREE from 'three'
import { latLngToVector3, orientOnGlobe } from '@/lib/globeMath'
import type { GlobeItem } from '@/lib/globeFigurines'

interface FigurineProps {
  item: GlobeItem
  onSelect: (item: GlobeItem) => void
}

function ProceduralOrb({ color, emissive }: { color: string; emissive: string }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.55}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  )
}

function ProceduralLantern() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.55, 12]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color="#ffd27a"
          emissive="#ffb347"
          emissiveIntensity={0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 12]} />
        <meshStandardMaterial color="#c4a574" roughness={0.6} />
      </mesh>
    </group>
  )
}

function ModelFigurine({ url }: { url: string }) {
  const gltf = useGLTF(url, true, true)
  return <Clone object={gltf.scene} castShadow receiveShadow />
}

/** Ease-out-back for soft overshoot (approx 400ms when progress 0→1). */
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function Figurine({ item, onSelect }: FigurineProps) {
  const groupRef = useRef<THREE.Group>(null)
  const progressRef = useRef(0)

  const position = useMemo(
    () => latLngToVector3(item.lat, item.lng, undefined, item.spec.altitude),
    [item.lat, item.lng, item.spec.altitude]
  )

  useEffect(() => {
    progressRef.current = 0
  }, [item.id])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    orientOnGlobe(groupRef.current, position)

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / 0.4)
    }
    const s = item.spec.scale * easeOutBack(progressRef.current)
    groupRef.current.scale.setScalar(Math.max(0.001, s))
  })

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(item)
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      {item.spec.modelUrl ? (
        <ModelFigurine url={item.spec.modelUrl} />
      ) : item.spec.kind === 'lantern' ? (
        <ProceduralLantern />
      ) : (
        <ProceduralOrb color="#FFD700" emissive="#FFA500" />
      )}
    </group>
  )
}

export function preloadFigurineModels(urls: string[]) {
  urls.forEach((url) => useGLTF.preload(url, true, true))
}
