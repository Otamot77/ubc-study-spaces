import { describe, expect, it } from 'vitest'
import { demoStudySpaces } from './studySpaces'

describe('campus marker data', () => {
  it('uses unique stable IDs', () => {
    expect(new Set(demoStudySpaces.map((space) => space.id)).size).toBe(demoStudySpaces.length)
  })

  it('places every marker within the UBC Vancouver campus area', () => {
    for (const space of demoStudySpaces) {
      expect(space.coordinates.lat).toBeGreaterThan(49.25)
      expect(space.coordinates.lat).toBeLessThan(49.28)
      expect(space.coordinates.lng).toBeGreaterThan(-123.27)
      expect(space.coordinates.lng).toBeLessThan(-123.23)
    }
  })

  it('provides a directions query for each entry', () => {
    expect(demoStudySpaces.every((space) => space.directionsQuery.trim().length > 0)).toBe(true)
  })
})
