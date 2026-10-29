// Approximate UBC building-level coordinates, not verified study-zone entrances.
// See ../docs/MAP_DATA.md for the sources. No invented occupancy data is seeded.
export const spaces = Object.freeze([
  { id: 'koerner', name: 'Koerner Library', coordinates: { lat: 49.2666389, lng: -123.2551217 }, recommendedRank: 1, directionsQuery: 'Koerner Library, UBC, Vancouver' },
  { id: 'ikb', name: 'Irving K. Barber', coordinates: { lat: 49.267511, lng: -123.2527 }, recommendedRank: 2, directionsQuery: 'Irving K. Barber Learning Centre, UBC, Vancouver' },
  { id: 'nest', name: 'AMS Nest', coordinates: { lat: 49.2666, lng: -123.24986 }, recommendedRank: 4, directionsQuery: 'AMS Nest, UBC, Vancouver' },
  { id: 'woodward', name: 'Woodward Library', coordinates: { lat: 49.2645246, lng: -123.2475579 }, recommendedRank: 3, directionsQuery: 'Woodward Library, UBC, Vancouver' },
  { id: 'life', name: 'Life Building', coordinates: { lat: 49.267471, lng: -123.249975 }, recommendedRank: 5, directionsQuery: 'UBC Life Building, Vancouver' },
  { id: 'icics', name: 'ICICS', coordinates: { lat: 49.261214, lng: -123.2488437 }, recommendedRank: 6, directionsQuery: 'ICICS, UBC, Vancouver' },
  { id: 'lam', name: 'David Lam Library', coordinates: { lat: 49.2657288, lng: -123.2543331 }, recommendedRank: 7, directionsQuery: 'David Lam Library, UBC, Vancouver' },
  { id: 'education', name: 'Education Library', coordinates: { lat: 49.263806, lng: -123.253325 }, recommendedRank: 8, directionsQuery: 'Education Library, UBC, Vancouver' },
])
export const spaceIds = new Set(spaces.map((space) => space.id))
