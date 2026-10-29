import type { Busyness, SortMode, StudySpace } from '../types'

const busynessOrder: Record<Busyness, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  unknown: 3,
}

export function sortStudySpaces(spaces: readonly StudySpace[], mode: SortMode): StudySpace[] {
  // Never mutate caller-owned data. Unknown busyness sorts last in least-busy mode.
  return [...spaces].sort((a, b) => {
    if (mode === 'closest') {
      return a.walkingMinutes - b.walkingMinutes || a.name.localeCompare(b.name)
    }

    if (mode === 'least-busy') {
      return (
        busynessOrder[a.busyness] - busynessOrder[b.busyness] ||
        a.walkingMinutes - b.walkingMinutes
      )
    }

    // Demo-only recommendation order. A real ranking algorithm is not implemented.
    return a.recommendedRank - b.recommendedRank
  })
}

export function directionsUrl(space: StudySpace): string {
  const query = encodeURIComponent(space.directionsQuery)
  return 'https://www.google.com/maps/dir/?api=1&destination=' + query + '&travelmode=walking'
}
