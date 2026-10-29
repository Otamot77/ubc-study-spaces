import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReportLocationPicker } from './ReportLocationPicker'
import type { StudySpace } from '../types'

const space: StudySpace = {
  id: 'koerner',
  name: 'Koerner Library',
  coordinates: { lat: 49.2666, lng: -123.2551 },
  walkingMinutes: null,
  busyness: 'unknown',
  recentReportCount: 0,
  latestReportMinutesAgo: null,
  confidence: 'none',
  recommendedRank: 1,
  directionsQuery: 'Koerner Library, UBC',
}

describe('ReportLocationPicker', () => {
  it('shows a labelled location button rather than an unstyled native select', () => {
    const markup = renderToStaticMarkup(
      <ReportLocationPicker spaces={[space]} selected={space} disabled={false} onSelect={() => {}} />,
    )
    expect(markup).toContain('Koerner Library')
    expect(markup).toContain('Study space')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).not.toContain('<select')
  })

  it('locks location changes while a report is submitting or saved', () => {
    const markup = renderToStaticMarkup(
      <ReportLocationPicker spaces={[space]} selected={space} disabled onSelect={() => {}} />,
    )
    expect(markup).toContain('disabled=""')
  })
})
