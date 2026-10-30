import { describe, expect, it } from 'vitest'
import { distanceMeters, formatDistance, withDistances } from './distance'
import type { StartingPoint, StudySpace } from '../types'

const point: StartingPoint = {
  source: 'manual', label: 'AMS Nest',
  coordinates: { lat: 49.2666, lng: -123.24986 },
}
const space: StudySpace = {
  id: 'nest', name: 'AMS Nest', coordinates: point.coordinates,
  walkingMinutes: null, distanceMeters: null, busyness: 'unknown',
  recentReportCount: 0, latestReportMinutesAgo: null,
  confidence: 'none', recommendedRank: 1, directionsQuery: 'AMS Nest, UBC',
}

describe('straight-line distances', () => {
  it('reports zero at the selected landmark', () => {
    expect(distanceMeters(point.coordinates, space.coordinates)).toBe(0)
    expect(withDistances([space], point)[0].distanceMeters).toBe(0)
  })
  it('calculates physically plausible distances at UBC', () => {
    const distance = distanceMeters(point.coordinates, { lat: 49.2676, lng: -123.24986 })
    expect(distance).toBeGreaterThan(110)
    expect(distance).toBeLessThan(113)
  })
  it('does not alter server objects and handles disabled location', () => {
    const withOrigin = withDistances([space], point)
    expect(withOrigin[0]).not.toBe(space)
    expect(space.distanceMeters).toBeNull()
    expect(withDistances(withOrigin, null)[0].distanceMeters).toBeNull()
  })
  it('formats metres and kilometres without implying a walking route', () => {
    expect(formatDistance(0)).toBe('~0 m away')
    expect(formatDistance(342)).toBe('~340 m away')
    expect(formatDistance(1250)).toBe('~1.3 km away')
    expect(formatDistance(null)).toBe('Distance unavailable')
  })
})
