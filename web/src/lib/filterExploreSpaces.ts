import { filterBuildings } from './filterBuildings'
import type { Busyness, StudySpace } from '../types'

export type AvailabilityFilter = 'all' | Busyness

/**
 * Filters already-sorted server-backed study spaces without changing map markers
 * or requesting new data. Values represent crowdsourced statuses, not seats.
 */
export function filterExploreSpaces(
  spaces: readonly StudySpace[],
  query: string,
  status: AvailabilityFilter,
): StudySpace[] {
  const matched = filterBuildings(spaces, query)
  return status === 'all' ? matched : matched.filter((space) => space.busyness === status)
}
