import type { Busyness, SortMode, StudySpace } from '../types'

const busynessOrder: Record<Busyness, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  unknown: 3,
}
const confidencePenalty = { high: 0, medium: 1, low: 2, none: 3 } as const

export function sortStudySpaces(spaces: readonly StudySpace[], mode: SortMode): StudySpace[] {
  return [...spaces].sort((a, b) => {
    if (mode === 'closest') {
      return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity) ||
        a.recommendedRank - b.recommendedRank
    }

    if (mode === 'least-busy') {
      return busynessOrder[a.busyness] - busynessOrder[b.busyness] ||
        a.recommendedRank - b.recommendedRank
    }

    // Baseline: availability, confidence, and established building order.
    return busynessOrder[a.busyness] - busynessOrder[b.busyness] ||
      confidencePenalty[a.confidence] - confidencePenalty[b.confidence] ||
      a.recommendedRank - b.recommendedRank
  })
}

export function directionsUrl(space: StudySpace): string {
  const query = encodeURIComponent(space.directionsQuery)
  return 'https://www.google.com/maps/dir/?api=1&destination=' + query + '&travelmode=walking'
}
