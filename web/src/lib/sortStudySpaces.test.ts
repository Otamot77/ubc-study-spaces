import { describe, expect, it } from 'vitest'
import { sortStudySpaces } from './sortStudySpaces'
import type { StudySpace } from '../types'

const base: Omit<StudySpace, 'id' | 'busyness' | 'walkingMinutes' | 'distanceMeters' | 'recommendedRank' | 'confidence'> = {
  name: 'Study space',
  coordinates: { lat: 49.26, lng: -123.25 },
  recentReportCount: 0,
  latestReportMinutesAgo: null,
  directionsQuery: 'UBC Vancouver',
}

const spaces: StudySpace[] = [
  { ...base, id: 'a', busyness: 'unknown', walkingMinutes: null, distanceMeters: null, recommendedRank: 1, confidence: 'none' },
  { ...base, id: 'b', busyness: 'high', walkingMinutes: null, distanceMeters: 140, recommendedRank: 4, confidence: 'high' },
  { ...base, id: 'c', busyness: 'low', walkingMinutes: null, distanceMeters: 800, recommendedRank: 3, confidence: 'low' },
  { ...base, id: 'd', busyness: 'low', walkingMinutes: null, distanceMeters: 200, recommendedRank: 2, confidence: 'high' },
]

describe('sortStudySpaces', () => {
  it('sorts by geographic distance, regardless of busyness, with missing distances last', () => {
    expect(sortStudySpaces(spaces, 'closest').map((space) => space.id)).toEqual(['b', 'd', 'c', 'a'])
  })
  it('puts unknown busyness last and low busyness first', () => {
    expect(sortStudySpaces(spaces, 'least-busy').map((space) => space.id)).toEqual(['d', 'c', 'b', 'a'])
  })
  it('prefers confident lower occupancy in recommendations', () => {
    expect(sortStudySpaces(spaces, 'recommended').map((space) => space.id)).toEqual(['d', 'c', 'b', 'a'])
  })
  it('preserves the input array', () => {
    const original = [...spaces]
    sortStudySpaces(spaces, 'closest')
    expect(spaces).toEqual(original)
  })
})
