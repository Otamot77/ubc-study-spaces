import type { StudySpace } from '../types'

// Temporary fixtures ONLY. These buildings are used for interface illustration.
// No crowd observations, walking times, or recommendations below are real.
export const demoStudySpaces: StudySpace[] = [
  { id: 'koerner', name: 'Koerner Library', walkingMinutes: 5, busyness: 'low', recentReportCount: 3, latestReportMinutesAgo: 6, recommendedRank: 1, directionsQuery: 'Koerner Library, UBC, Vancouver' },
  { id: 'ikb', name: 'Irving K. Barber', walkingMinutes: 7, busyness: 'moderate', recentReportCount: 5, latestReportMinutesAgo: 4, recommendedRank: 2, directionsQuery: 'Irving K. Barber Learning Centre, UBC, Vancouver' },
  { id: 'nest', name: 'AMS Nest', walkingMinutes: 9, busyness: 'high', recentReportCount: 4, latestReportMinutesAgo: 3, recommendedRank: 4, directionsQuery: 'AMS Nest, UBC, Vancouver' },
  { id: 'woodward', name: 'Woodward Library', walkingMinutes: 11, busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, recommendedRank: 3, directionsQuery: 'Woodward Library, UBC, Vancouver' },
  { id: 'life', name: 'Life Building', walkingMinutes: 8, busyness: 'moderate', recentReportCount: 2, latestReportMinutesAgo: 12, recommendedRank: 5, directionsQuery: 'UBC Life Building, Vancouver' },
  { id: 'icics', name: 'ICICS', walkingMinutes: 10, busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, recommendedRank: 6, directionsQuery: 'ICICS, UBC, Vancouver' },
  { id: 'lam', name: 'David Lam Library', walkingMinutes: 13, busyness: 'low', recentReportCount: 2, latestReportMinutesAgo: 8, recommendedRank: 7, directionsQuery: 'David Lam Library, UBC, Vancouver' },
  { id: 'education', name: 'Education Library', walkingMinutes: 15, busyness: 'high', recentReportCount: 1, latestReportMinutesAgo: 5, recommendedRank: 8, directionsQuery: 'Education Library, UBC, Vancouver' },
]
