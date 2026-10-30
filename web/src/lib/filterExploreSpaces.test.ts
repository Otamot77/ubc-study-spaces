import { describe, expect, it } from 'vitest'
import { filterExploreSpaces } from './filterExploreSpaces'
import type { StudySpace } from '../types'

const base: Omit<StudySpace,'id'|'name'|'busyness'> = {
  coordinates: { lat:49.265,lng:-123.25 }, walkingMinutes:null, distanceMeters:null,
  recentReportCount:0, latestReportMinutesAgo:null, confidence:'none',
  recommendedRank:1, directionsQuery:'UBC',
}
const spaces: StudySpace[] = [
  { ...base, id:'koerner', name:'Koerner Library', busyness:'low' },
  { ...base, id:'ikb', name:'Irving K. Barber Learning Centre', busyness:'unknown' },
  { ...base, id:'nest', name:'AMS Nest', busyness:'moderate' },
  { ...base, id:'xwi7xwa', name:'X̱wi7x̱wa Library', busyness:'high' },
]
describe('Explore list filters', () => {
  it('shows all results by default and preserves the sort order', () => {
    expect(filterExploreSpaces(spaces, '', 'all')).toEqual(spaces)
    expect(filterExploreSpaces(spaces, '', 'all')).not.toBe(spaces)
  })
  it('supports combined name search and status filters', () => {
    expect(filterExploreSpaces(spaces, 'LIBRARY','low').map(s=>s.id)).toEqual(['koerner'])
    expect(filterExploreSpaces(spaces, 'LIBRARY','high').map(s=>s.id)).toEqual(['xwi7xwa'])
    expect(filterExploreSpaces(spaces, 'LIBRARY','moderate')).toEqual([])
    expect(filterExploreSpaces(spaces, 'nest','moderate').map(s=>s.id)).toEqual(['nest'])
  })
  it('does not treat unknown occupancy as likely available', () => {
    expect(filterExploreSpaces(spaces,'','unknown').map(s=>s.id)).toEqual(['ikb'])
  })
  it('allows easy ASCII search for the official Indigenous spelling', () => {
    expect(filterExploreSpaces(spaces,'Xwi7xwa','all')[0].name).toBe('X\u0331wi7x\u0331wa Library')
  })
  it('does not modify the API-sourced list', () => {
    const original = [...spaces]
    filterExploreSpaces(spaces, 'Koerner', 'high')
    expect(spaces).toEqual(original)
  })
})
