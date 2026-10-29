import { describe, expect, it } from 'vitest'
import { demoStudySpaces } from '../data/studySpaces'
import { sortStudySpaces } from './sortStudySpaces'

describe('sortStudySpaces', () => {
  it('sorts by ascending walking time', () => {
    const result = sortStudySpaces([...demoStudySpaces].reverse(), 'closest')
    expect(result.map((s) => s.walkingMinutes)).toEqual(
      [...result.map((s) => s.walkingMinutes)].sort((a, b) => a - b),
    )
  })

  it('puts unknown busyness last and low busyness first', () => {
    const result = sortStudySpaces(demoStudySpaces, 'least-busy')
    expect(result[0].busyness).toBe('low')
    expect(result[result.length - 1].busyness).toBe('unknown')
  })

  it('uses sample recommendation rankings', () => {
    const result = sortStudySpaces(demoStudySpaces, 'recommended')
    expect(result.map((s) => s.recommendedRank)).toEqual(
      [...result.map((s) => s.recommendedRank)].sort((a, b) => a - b),
    )
  })

  it('does not modify its input array', () => {
    const original = [...demoStudySpaces]
    sortStudySpaces(demoStudySpaces, 'least-busy')
    expect(demoStudySpaces).toEqual(original)
  })
})
