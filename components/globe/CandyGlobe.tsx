'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three'
import type { Miracle, PrayerRequest } from '@/lib/mapUtils'
import type { LayerType } from '@/components/layout/LayerToggle'
import { GLOBE_RADIUS, vector3ToLatLng } from '@/lib/globeMath'
import Earth from './Earth'
import Atmosphere from './Atmosphere'
import FigurineLayer from './FigurineLayer'
import Starfield from './Starfield'

export interface CandyGlobeProps {
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayer: PrayerRequest) => void
  onMapClick?: (location: { lat: number; lng: number }) => void
  loading: boolean
  prayerLoading: boolean
  activeLayer: LayerType
  onZoomControlsReady?: (controls: {
    zoomIn: () => void
    zoomOut: () => void
    fitBounds: () => void
    worldView: () => void
  }) => void
  getTranslation: (key: string, fallback: string) => string
}

function RotatingWorld({
  dragging,
  children,
}: {
  dragging: boolean
  children: React.ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!groupRef.current || dragging) return
    groupRef.current.rotation.y += delta * 0.05
  })
  return <group ref={groupRef}>{children}</group>
}

function GlobeScene({
  miracles,
  prayerRequests,
  activeLayer,
  onMiracleSelect,
  onPrayerSelect,
  onMapClick,
  dragging,
  setDragging,
  controlsRef,
}: {
  miracles: Miracle[]
  prayerRequests: PrayerRequest[]
  activeLayer: LayerType
  onMiracleSelect: (miracle: Miracle) => void
  onPrayerSelect: (prayer: PrayerRequest) => void
  onMapClick?: (location: { lat: number; lng: number }) => void
  dragging: boolean
  setDragging: (v: boolean) => void
  controlsRef: React.MutableRefObject<any>
}) {
  const handleGlobeClick = useCallback(
    (event: any) => {
      if (!onMapClick) return
      const point = event.point as THREE.Vector3
      if (!point || !event.object) return
      // Convert world hit to local sphere coords (accounts for auto-rotate)
      const local = event.object.worldToLocal(point.clone())
      onMapClick(vector3ToLatLng(local))
    },
    [onMapClick]
  )

  return (
    <>
      <color attach="background" args={['#fff0e0']} />
      <fog attach="fog" args={['#ffe8d2', 7, 20]} />

      <ambientLight intensity={0.7} color="#fff5e6" />
      <directionalLight
        position={[5, 4, 3]}
        intensity={1.45}
        color="#ffd9a8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 1, -2]} intensity={0.4} color="#b8d8ff" />

      <Starfield count={1200} radius={40} />

      <Suspense fallback={null}>
        <RotatingWorld dragging={dragging}>
          <Earth />
          <mesh onClick={handleGlobeClick}>
            <sphereGeometry args={[GLOBE_RADIUS * 1.002, 48, 48]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <FigurineLayer
            miracles={miracles}
            prayerRequests={prayerRequests}
            activeLayer={activeLayer}
            onMiracleSelect={onMiracleSelect}
            onPrayerSelect={onPrayerSelect}
          />
        </RotatingWorld>
        <Atmosphere />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={GLOBE_RADIUS * 1.35}
        maxDistance={GLOBE_RADIUS * 4.5}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        onStart={() => setDragging(true)}
        onEnd={() => setDragging(false)}
      />
    </>
  )
}

export default function CandyGlobe({
  miracles,
  prayerRequests,
  onMiracleSelect,
  onPrayerSelect,
  onMapClick,
  loading,
  prayerLoading,
  activeLayer,
  onZoomControlsReady,
  getTranslation,
}: CandyGlobeProps) {
  const [dragging, setDragging] = useState(false)
  const controlsRef = useRef<any>(null)
  const isLoading = loading || prayerLoading

  useEffect(() => {
    if (!onZoomControlsReady) return
    onZoomControlsReady({
      zoomIn: () => {
        const c = controlsRef.current
        if (!c) return
        c.object.position.multiplyScalar(0.88)
        c.update()
      },
      zoomOut: () => {
        const c = controlsRef.current
        if (!c) return
        c.object.position.multiplyScalar(1.12)
        c.update()
      },
      fitBounds: () => {
        const c = controlsRef.current
        if (!c) return
        c.object.position.set(0, 0.4, GLOBE_RADIUS * 2.6)
        c.target.set(0, 0, 0)
        c.update()
      },
      worldView: () => {
        const c = controlsRef.current
        if (!c) return
        c.object.position.set(0, 0.6, GLOBE_RADIUS * 3.2)
        c.target.set(0, 0, 0)
        c.update()
      },
    })
  }, [onZoomControlsReady])

  const glFactory = useMemo(
    () => async (props: any) => {
      const renderer = new WebGPURenderer({
        ...props,
        antialias: true,
        powerPreference: 'high-performance',
      })
      await renderer.init()
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      return renderer
    },
    []
  )

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0.5, GLOBE_RADIUS * 2.8], fov: 42, near: 0.1, far: 100 }}
        gl={glFactory as any}
        dpr={[1, 1.75]}
      >
        <GlobeScene
          miracles={miracles}
          prayerRequests={prayerRequests}
          activeLayer={activeLayer}
          onMiracleSelect={onMiracleSelect}
          onPrayerSelect={onPrayerSelect}
          onMapClick={onMapClick}
          dragging={dragging}
          setDragging={setDragging}
          controlsRef={controlsRef}
        />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-sky-50/40">
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-miracle-teal font-semibold text-sm">
              {getTranslation('map.loadingWorld', 'Waking up the candy world...')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
