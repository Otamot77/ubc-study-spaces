export type Busyness = 'low' | 'moderate' | 'high' | 'unknown'
export type Confidence = 'none' | 'low' | 'medium' | 'high'
export type SortMode = 'recommended' | 'least-busy' | 'closest'

/** The /api/spaces response: no generated or fictional occupancy fields. */
export interface StudySpace {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  walkingMinutes: number | null
  busyness: Busyness
  recentReportCount: number
  latestReportMinutesAgo: number | null
  confidence: Confidence
  recommendedRank: number
  directionsQuery: string
}
