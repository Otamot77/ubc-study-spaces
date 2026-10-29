import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { MAP_MARKER_ANCHOR, MAP_MARKER_SIZE, mapMarkerSvg } from './mapMarkerIcons'

describe('map marker icons', () => {
  it('uses the same centered anchor regardless of zoom level', () => {
    expect(MAP_MARKER_ANCHOR).toBe(MAP_MARKER_SIZE / 2)
  })

  it('uses matching status glyphs instead of featureless dots', () => {
    expect(mapMarkerSvg('low')).toContain('m9 12 2 2 4-4')
    expect(mapMarkerSvg('moderate')).toContain('r="1"')
    expect(mapMarkerSvg('high')).toContain('M12 8v4')
    expect(mapMarkerSvg('unknown')).toContain('M9.09 9')
  })

  it('does not override Leaflet absolute positioning with relative positioning', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    const markerRule = css.match(/\.study-pin\s*\{([^}]*)\}/)?.[1]
    expect(markerRule).toMatch(/position:\s*absolute/)
    expect(markerRule).not.toMatch(/position:\s*relative/)
  })
})
