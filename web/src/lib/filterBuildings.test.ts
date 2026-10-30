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
  { ...base, id: 'xwi7xwa', name: 'X̱wi7x̱wa Library' },
]

describe('filterBuildings', () => {
  it('returns all buildings for an empty query without mutating the list', () => {
    const result = filterBuildings(spaces, '  ')
    expect(result).toEqual(spaces)
    expect(result).not.toBe(spaces)
  })
  it('matches building names ignoring case and extra spaces', () => {
    expect(filterBuildings(spaces, '  liBRarY ' ).map((s) => s.id)).toEqual(['koerner','woodward','xwi7xwa'])
    expect(filterBuildings(spaces, ' irving  barber ').map((s) => s.id)).toEqual(['ikb'])
  })
  it('matches campus abbreviations and shows no false results', () => {
    expect(filterBuildings(spaces, 'IKB').map((s) => s.id)).toEqual(['ikb'])
    expect(filterBuildings(spaces, 'ICICS').map((s) => s.id)).toEqual(['icics'])
    expect(filterBuildings(spaces, 'nonexistent')).toEqual([])
  })
})

describe('Indigenous-language building name search', () => {
  it('finds X̱wi7x̱wa with or without combining low lines', () => {
    for (const query of ['X̱wi7x̱wa', 'Xwi7xwa', 'xwi7xwa', 'X̱WI7X̱WA library']) {
      expect(filterBuildings(spaces, query).map((s) => s.id)).toEqual(['xwi7xwa'])
    }
  })
  it('preserves official spelling in results instead of rewriting it', () => {
    expect(filterBuildings(spaces, 'xwi7xwa')[0].name).toBe('X\u0331wi7x\u0331wa Library')
  })
})
