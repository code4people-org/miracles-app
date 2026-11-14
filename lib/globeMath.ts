import * as THREE from 'three'

/** Earth sphere radius in scene units */
export const GLOBE_RADIUS = 2

/**
 * Convert geographic lat/lng (degrees) to a position on the unit sphere,
 * then scale to GLOBE_RADIUS.
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = GLOBE_RADIUS,
  altitude: number = 0
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const r = radius + altitude
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

/** Inverse of latLngToVector3 for raycast hits on the globe surface. */
export function vector3ToLatLng(
  point: THREE.Vector3,
  radius: number = GLOBE_RADIUS
): { lat: number; lng: number } {
  const p = point.clone().normalize()
  const lat = 90 - (Math.acos(THREE.MathUtils.clamp(p.y, -1, 1)) * 180) / Math.PI
  const lng =
    ((Math.atan2(p.z, -p.x) * 180) / Math.PI) - 180
  // Normalize lng to [-180, 180]
  let normalizedLng = ((lng + 180) % 360 + 360) % 360 - 180
  void radius
  return { lat, lng: normalizedLng }
}

/** Orient an object so +Y points outward from the globe center. */
export function orientOnGlobe(
  object: THREE.Object3D,
  position: THREE.Vector3
): void {
  object.position.copy(position)
  const up = position.clone().normalize()
  const quat = new THREE.Quaternion()
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up)
  object.quaternion.copy(quat)
}
