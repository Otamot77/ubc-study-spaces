import { describe, expect, it } from 'vitest'
import { demoStudySpaces } from '../data/studySpaces'
import { sortStudySpaces } from './sortStudySpaces'

describe('sortStudySpaces', () => {
  it('sorts by walking time', () => {
    const result = sortStudySpaces([...demoStudySpaces].reverse(), 'closest')
    expect(result.map((s) => s.id)).toEqual(['koerner', 'ikb', 'nest', 'woodward'])
  })

  it('puts unknown busyness last and low busyness first', () => {
    const result = sortStudySpaces(demoStudySpaces, 'least-busy')
    expect(result.map((s) => s.id)).toEqual(['koerner', 'ikb', 'nest', 'woodward'])
  })

  it('uses clearly fictional recommendation rankings', () => {
    const result = sortStudySpaces(demoStudySpaces, 'recommended')
    expect(result.map((s) => s.id)).toEqual(['koerner', 'ikb', 'woodward', 'nest'])
  })

  it('does not modify the source list', () => {
    const original = [...demoStudySpaces]
    sortStudySpaces(demoStudySpaces, 'recommended')
    expect(demoStudySpaces).toEqual(original)
  })
})
