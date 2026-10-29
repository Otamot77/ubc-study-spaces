import type { StudySpace } from '../types'

// Temporary design fixtures only. Times, occupancy, and report counts are fictional.
// Do not use these as real UBC availability information.
export const demoStudySpaces: StudySpace[] = [
  {
    id: 'koerner',
    name: 'Koerner Library',
    walkingMinutes: 5,
    busyness: 'low',
    recentReportCount: 3,
    latestReportMinutesAgo: 6,
    recommendedRank: 1,
    directionsQuery: 'Koerner Library, UBC, Vancouver',
  },
  {
    id: 'ikb',
    name: 'Irving K. Barber',
    walkingMinutes: 7,
    busyness: 'moderate',
    recentReportCount: 5,
    latestReportMinutesAgo: 4,
    recommendedRank: 2,
    directionsQuery: 'Irving K. Barber Learning Centre, UBC, Vancouver',
  },
  {
    id: 'nest',
    name: 'AMS Nest',
    walkingMinutes: 9,
    busyness: 'high',
    recentReportCount: 4,
    latestReportMinutesAgo: 3,
    recommendedRank: 4,
    directionsQuery: 'AMS Nest, UBC, Vancouver',
  },
  {
    id: 'woodward',
    name: 'Woodward Library',
    walkingMinutes: 11,
    busyness: 'unknown',
    recentReportCount: 0,
    latestReportMinutesAgo: null,
    recommendedRank: 3,
    directionsQuery: 'Woodward Library, UBC, Vancouver',
  },
]
