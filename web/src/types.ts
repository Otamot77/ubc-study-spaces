export type Busyness = 'low' | 'moderate' | 'high' | 'unknown'
export type Confidence = 'none' | 'low' | 'medium' | 'high'
export type SortMode = 'recommended' | 'least-busy' | 'closest'

export interface Coordinates {
  lat: number
  lng: number
}

export interface StartingPoint {
  source: 'gps' | 'manual'
  label: string
  coordinates: Coordinates
  /** Only available from the browser's reported accuracy, never stored remotely. */
  accuracyMeters?: number
}

/** Building data from /api/spaces, plus client-calculated straight-line distance. */
export interface StudySpace {
  id: string
  name: string
  coordinates: Coordinates
  walkingMinutes: number | null
  /** In-memory straight-line distance, not route length or estimated walking time. */
  distanceMeters: number | null
  busyness: Busyness
  recentReportCount: number
  latestReportMinutesAgo: number | null
  confidence: Confidence
  recommendedRank: number
  directionsQuery: string
}
