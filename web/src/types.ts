export type Busyness = 'low' | 'moderate' | 'high' | 'unknown'
export type SortMode = 'recommended' | 'least-busy' | 'closest'

export interface StudySpace {
  id: string
  name: string
  /** Approximate building point, not a verified entrance or study-zone position. */
  coordinates: { lat: number; lng: number }
  /** Design fixture until pedestrian routing is integrated. */
  walkingMinutes: number
  /** Design fixture until reports are persisted. */
  busyness: Busyness
  recentReportCount: number
  latestReportMinutesAgo: number | null
  recommendedRank: number
  directionsQuery: string
}
