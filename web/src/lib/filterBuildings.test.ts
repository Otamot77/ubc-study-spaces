import { describe, expect, it } from 'vitest'
import { filterBuildings } from './filterBuildings'
import type { StudySpace } from '../types'

const base: Omit<StudySpace, 'id' | 'name'> = {
  coordinates: { lat: 49.266, lng: -123.25 }, walkingMinutes: null,
  distanceMeters: null, busyness: 'unknown', confidence: 'none',
  recentReportCount: 0, latestReportMinutesAgo: null,
  recommendedRank: 1, directionsQuery: 'UBC',
}
const spaces: StudySpace[] = [
  { ...base, id: 'ikb', name: 'Irving K. Barber' },
  { ...base, id: 'koerner', name: 'Koerner Library' },
  { ...base, id: 'woodward', name: 'Woodward Library' },
  { ...base, id: 'icics', name: 'ICICS' },
]

describe('filterBuildings', () => {
  it('returns all buildings for an empty query without mutating the list', () => {
    const result = filterBuildings(spaces, '  ')
    expect(result).toEqual(spaces)
    expect(result).not.toBe(spaces)
  })
  it('matches building names ignoring case and extra spaces', () => {
    expect(filterBuildings(spaces, '  liBRarY ' ).map((s) => s.id)).toEqual(['koerner','woodward'])
    expect(filterBuildings(spaces, ' irving  barber ').map((s) => s.id)).toEqual(['ikb'])
  })
  it('matches campus abbreviations and shows no false results', () => {
    expect(filterBuildings(spaces, 'IKB').map((s) => s.id)).toEqual(['ikb'])
    expect(filterBuildings(spaces, 'ICICS').map((s) => s.id)).toEqual(['icics'])
    expect(filterBuildings(spaces, 'nonexistent')).toEqual([])
  })
})
