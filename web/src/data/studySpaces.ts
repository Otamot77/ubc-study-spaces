import type { StudySpace } from '../types'

// Approximate building coordinates from published maps; see docs/MAP_DATA.md.
// All occupancy levels, times, report counts and ranking values are fictional.
export const demoStudySpaces: StudySpace[] = [
  { id: 'koerner', name: 'Koerner Library', coordinates: { lat: 49.2666389, lng: -123.2551217 }, walkingMinutes: 5, busyness: 'low', recentReportCount: 3, latestReportMinutesAgo: 6, recommendedRank: 1, directionsQuery: 'Koerner Library, UBC, Vancouver' },
  { id: 'ikb', name: 'Irving K. Barber', coordinates: { lat: 49.267511, lng: -123.2527 }, walkingMinutes: 7, busyness: 'moderate', recentReportCount: 5, latestReportMinutesAgo: 4, recommendedRank: 2, directionsQuery: 'Irving K. Barber Learning Centre, UBC, Vancouver' },
  { id: 'nest', name: 'AMS Nest', coordinates: { lat: 49.2666, lng: -123.24986 }, walkingMinutes: 9, busyness: 'high', recentReportCount: 4, latestReportMinutesAgo: 3, recommendedRank: 4, directionsQuery: 'AMS Nest, UBC, Vancouver' },
  { id: 'woodward', name: 'Woodward Library', coordinates: { lat: 49.2645246, lng: -123.2475579 }, walkingMinutes: 11, busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, recommendedRank: 3, directionsQuery: 'Woodward Library, UBC, Vancouver' },
  { id: 'life', name: 'Life Building', coordinates: { lat: 49.267471, lng: -123.249975 }, walkingMinutes: 8, busyness: 'moderate', recentReportCount: 2, latestReportMinutesAgo: 12, recommendedRank: 5, directionsQuery: 'UBC Life Building, Vancouver' },
  { id: 'icics', name: 'ICICS', coordinates: { lat: 49.261214, lng: -123.2488437 }, walkingMinutes: 10, busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, recommendedRank: 6, directionsQuery: 'ICICS, UBC, Vancouver' },
  { id: 'lam', name: 'David Lam Library', coordinates: { lat: 49.2657288, lng: -123.2543331 }, walkingMinutes: 13, busyness: 'low', recentReportCount: 2, latestReportMinutesAgo: 8, recommendedRank: 7, directionsQuery: 'David Lam Library, UBC, Vancouver' },
  { id: 'education', name: 'Education Library', coordinates: { lat: 49.263806, lng: -123.253325 }, walkingMinutes: 15, busyness: 'high', recentReportCount: 1, latestReportMinutesAgo: 5, recommendedRank: 8, directionsQuery: 'Education Library, UBC, Vancouver' },
]
