import type { StudySpace } from '../types'

/** Lightweight local building search; nothing is sent to an external search service. */
export function filterBuildings(spaces: readonly StudySpace[], query: string): StudySpace[] {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [...spaces]
  return spaces.filter((space) => {
    // Also match IDs like "ikb" and "icics" used as campus abbreviations.
    const searchable = (space.name + ' ' + space.id).toLocaleLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}
