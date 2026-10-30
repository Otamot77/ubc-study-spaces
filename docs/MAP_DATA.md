# Campus map data sources

The app now lists **13 curated UBC Vancouver locations**. The full source-by-source audit, study-zone evidence, access caveats and venue descriptions are in [STUDY_SPACE_DATA.md](STUDY_SPACE_DATA.md).

All plotted coordinates are approximate building-centre locations, **not** confirmed public entrances or individual study seats.

| ID | Latitude | Longitude | Coordinate source |
| --- | ---: | ---: | --- |
| `koerner` | 49.2666389 | -123.2551217 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `ikb` | 49.267511 | -123.2527 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `nest` | 49.2666 | -123.24986 | [Original map sources](https://seabc.ca/wordpress/files/notable_structures/Vancouver_Notable_Structures_IABSE_SEABC_2017.pdf) |
| `woodward` | 49.2645246 | -123.2475579 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `life` | 49.267471 | -123.249975 | [UBC Student Services](https://students.ubc.ca/about-student-services/ubc-life-building/) and existing coordinate |
| `icics` | 49.261214 | -123.2488437 | [UBC Wiki building map](https://wiki.prod.apps.ctlt.ubc.ca/ICICS/CS_Building) |
| `lam` | 49.2657288 | -123.2543331 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `education` | 49.263806 | -123.253325 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library); now **Education Learning Commons** |
| `law` | 49.270014 | -123.253187 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `asian` | 49.2667824 | -123.2587159 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `xwi7xwa` | 49.2654802 | -123.2565379 | [UBC Library map](https://wiki.prod.apps.ctlt.ubc.ca/Library) |
| `hennings` | 49.2664342 | -123.2522142 | [UBC Wiki building](https://wiki.prod.apps.ctlt.ubc.ca/Hennings_Building) |
| `edc` | 49.26235 | -123.24819 | [OSM building geometry](https://mapcarta.com/W150420271), corroborated address via [UBC Campus Planning](https://planning.ubc.ca/wayne-and-william-white-engineering-design-centre-edc) |

## Runtime semantics and map service

- The **venue records and coordinates** are curated data. The **crowd estimates** are separate, calculated only from actual reports saved by this API; no fictional crowd reports are seeded.
- No live walking-time predictions. Closest sorts by rounded client-side **straight-line distance** from an opt-in starting point.
- The map uses Leaflet and OpenStreetMap tiles with attribution. Follow the [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and arrange a compliant production tile provider before public launch.
- Hour links open official UBC Library schedules; this app does not currently compute "open now."

## Future

Field-check public entrances and actual study zones, and consider routing and booking requirements once the core discovery/reporting experience has been validated.
