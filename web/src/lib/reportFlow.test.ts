import { describe, expect, it } from 'vitest'
import { buildReportRequest, correctionAllowed, nextReportLevel } from './reportFlow'
import type { SavedReport } from './reportFlow'

const saved: SavedReport = {
  reportId: 23, editToken: 'private-token', editableUntil: 120_000, level: 'low',
}

describe('report correction flow', () => {
  it('uses one POST on the first tap', () => {
    expect(buildReportRequest('koerner', 'low', null)).toEqual({
      method: 'POST',
      url: '/api/spaces/koerner/reports',
      body: JSON.stringify({ level: 'low' }),
    })
  })
  it('PATCHes the same row rather than posting a second vote', () => {
    expect(buildReportRequest('koerner', 'high', saved)).toEqual({
      method: 'PATCH',
      url: '/api/spaces/koerner/reports/23',
      body: JSON.stringify({ level: 'high', editToken: 'private-token' }),
    })
  })
  it('undoes a selected choice with a PATCH rather than a second POST', () => {
    expect(nextReportLevel(saved, 'low')).toBeNull()
    expect(buildReportRequest('koerner', null, saved)).toEqual({
      method: 'PATCH',
      url: '/api/spaces/koerner/reports/23',
      body: JSON.stringify({ level: null, editToken: 'private-token' }),
    })
  })
  it('restores one vote after undo, without a new report', () => {
    const revoked: SavedReport = { ...saved, level: null }
    expect(nextReportLevel(revoked, 'high')).toBe('high')
    expect(buildReportRequest('koerner', 'high', revoked).method).toBe('PATCH')
    expect(() => buildReportRequest('koerner', null, null)).toThrow('Cannot undo')
  })
  it('respects the short correction window', () => {
    expect(correctionAllowed(saved, 119_999)).toBe(true)
    expect(correctionAllowed(saved, 120_001)).toBe(false)
  })
})
