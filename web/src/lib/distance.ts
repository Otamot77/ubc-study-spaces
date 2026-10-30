import type { Coordinates, StartingPoint, StudySpace } from '../types'

const EARTH_RADIUS_METERS = 6_371_000
const radians = (degrees: number) => degrees * Math.PI / 180

/** Straight-line (great-circle) distance, not a pedestrian route. */
export function distanceMeters(from: Coordinates, to: Coordinates): number {
  const deltaLat = radians(to.lat - from.lat)
  const deltaLng = radians(to.lng - from.lng)
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) *
    Math.sin(deltaLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function withDistances(spaces: readonly StudySpace[], point: StartingPoint | null): StudySpace[] {
  return spaces.map((space) => ({
    ...space,
    distanceMeters: point ? Math.round(distanceMeters(point.coordinates, space.coordinates) / 10) * 10 : null,
  }))
}

export function formatDistance(meters: number | null): string {
  if (meters === null || !Number.isFinite(meters)) return 'Distance unavailable'
  if (meters < 1000) return `~${Math.round(meters / 10) * 10} m away`
  return `~${(meters / 1000).toFixed(1)} km away`
}
