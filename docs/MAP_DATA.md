# Campus map data sources

Eight **approximate real building positions** are plotted. These are not verified entrances or specific study zones.

| Space | Latitude | Longitude | Source |
| --- | ---: | ---: | --- |
| Koerner Library | 49.2666389 | -123.2551217 | [UBC Library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| Irving K. Barber Learning Centre | 49.267511 | -123.2527 | [UBC Library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| Woodward Library | 49.2645246 | -123.2475579 | [UBC Library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| David Lam Library | 49.2657288 | -123.2543331 | [UBC Library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| Education Library | 49.263806 | -123.253325 | [UBC Library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| ICICS / CS Building | 49.261214 | -123.2488437 | [UBC Wiki building map](https://wiki.prod.apps.ctlt.ubc.ca/ICICS/CS_Building) |
| AMS Student Nest | 49.2666 | -123.24986 | [SEABC/IABSE building survey, page 37](https://seabc.ca/wordpress/files/notable_structures/Vancouver_Notable_Structures_IABSE_SEABC_2017.pdf) |
| UBC Life Building | 49.267471 | -123.249975 | [Norm Theatre venue](https://events.nfb.ca/locations/norm-theatre-ubc-life-building/); [UBC Student Services](https://students.ubc.ca/about-student-services/ubc-life-building/) |

## Limits and map service

- **All busyness, report count, freshness, walk-time and recommendation values are still fabricated fixtures for UI testing.** A real pin does not imply live seating availability.
- Building points are approximate. Confirm exact accessible entrances and study zones before publishing.
- Device geolocation and route-based walking times have not been implemented.
- The map uses [Leaflet](https://leafletjs.com/) with [OpenStreetMap](https://www.openstreetmap.org/) tiles. Visible attribution is required.
- Follow the [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/): no bulk/offline prefetch, honour caching/referer requirements, and don't assume production uptime. The tile URL may be overridden using `VITE_MAP_TILE_URL`.

## Future

Replace broad building markers with verified study zones, and integrate an appropriate pedestrian routing service and consent-based device location.
