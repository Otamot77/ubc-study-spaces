import type { Busyness } from '../types'

/**
 * Static SVG counterparts to the Lucide icons in BusynessIndicator.
 * Marker HTML never interpolates study-space names or other user data.
 */
const paths: Record<Busyness, string> = {
  low: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  moderate: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  high: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  unknown: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
}

export const MAP_MARKER_SIZE = 38
export const MAP_MARKER_ANCHOR = MAP_MARKER_SIZE / 2

export function mapMarkerSvg(state: Busyness): string {
  return '<svg class="study-pin__glyph" xmlns="http://www.w3.org/2000/svg" ' +
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths[state] + '</svg>'
}
