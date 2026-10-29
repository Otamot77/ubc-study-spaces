export type Busyness = 'low' | 'moderate' | 'high' | 'unknown'
export type SortMode = 'recommended' | 'least-busy' | 'closest'

export interface StudySpace {
  id: string
  name: string
  walkingMinutes: number
  busyness: Busyness
  recentReportCount: number
  latestReportMinutesAgo: number | null
  recommendedRank: number
  directionsQuery: string
}
