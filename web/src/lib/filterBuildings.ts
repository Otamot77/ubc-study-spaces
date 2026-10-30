import type { StudySpace } from '../types'

/**
 * Search without requiring a specialized keyboard.
 * U+0331 and other combining marks are ignored for matching ONLY.
 * The source/display name must retain its official Unicode characters.
 */
function searchKey(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
}

/** Lightweight local building search; nothing is sent to an external service. */
export function filterBuildings(spaces: readonly StudySpace[], query: string): StudySpace[] {
  const terms = searchKey(query).trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [...spaces]
  return spaces.filter((space) => {
    // Also match IDs like "ikb" and "icics" used as campus abbreviations.
    const searchable = searchKey(space.name + ' ' + space.id + ' ' + (space.address ?? ''))
    return terms.every((term) => searchable.includes(term))
  })
}
