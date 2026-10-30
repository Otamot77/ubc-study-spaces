# UBC Vancouver Study Space Data Audit

**Reviewed 2026-10-29.** This is a small curated dataset for the locally tested Study Spaces app, not an exhaustive campus directory.

## Inclusion and reliability rules

- List only an identifiable existing building or study zone with a traceable UBC / AMS source. Clearly mark broad building listings when a specific drop-in study zone is not verified.
- Locations are **approximate building-level map points**, not wheelchair entrances, room-specific GPS points, or a guarantee of available seating.
- Do not fabricate opening hours, outlet availability, acoustic levels or seat counts. The app links to official hours instead of claiming a place is currently open.
- No occupancy is seeded. New venues start as **Unknown** until someone submits a genuine report.
- An existing report's `space_id` is permanent: notably `education` remains unchanged after renaming the former Education Library.
- A single pin typically represents a venue or named study zone. Shared buildings may contain multiple room types or booking policies; do not interpret one pin as measuring every room.

## Curated locations

| ID | Display name | Type | Location evidence | Status / context |
| --- | --- | --- | --- | --- |
| `koerner` | Koerner Library | Library | [UBC branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library), [hours](https://hours.library.ubc.ca/) | Confirmed campus library |
| `ikb` | Irving K. Barber Learning Centre | Learning centre | [UBC branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library), [group study room booking](https://libcal.library.ubc.ca/spaces) | A building-level pin; some rooms bookable |
| `nest` | AMS Nest | Informal | [AMS building](https://www.ams.ubc.ca/your-building/), [study rooms](https://www.ams.ubc.ca/your-building/study-rooms/) | Social space, some dedicated rooms separately booked |
| `woodward` | Woodward Library | Library | [UBC branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library), [hours](https://hours.library.ubc.ca/) | Confirmed branch library |
| `life` | Life Building | Informal | [UBC Student Services](https://students.ubc.ca/about-student-services/ubc-life-building/) | UBC explicitly lists studying as a building use; individual study zones not checked |
| `icics` | ICICS / CS Building | Building | [ICICS building location](https://icics.ubc.ca/facilities/shared-facilities/locating-the-icicscs-usability-labs/) | **Study zone not independently confirmed**, preserve original entry pending in-person check |
| `lam` | David Lam Library | Library | [David Lam Library about](https://lam.library.ubc.ca/about-us/) | Individual and collaborative study in Canaccord Learning Commons |
| `education` | Education Learning Commons | Learning commons | [UBC Education Learning Commons](https://education.library.ubc.ca/), [UBC Faculty of Education](https://educ.ubc.ca/neville-scarfe-office-block-temporary-relocations-may-2025-august-2025/) | Renamed. **2025–26** space was open for studying; verify access for 2026–27 |
| `law` | Law Library | Library | [UBC Law Library](https://law.library.ubc.ca/about/), [UBC Library hours](https://hours.library.ubc.ca/) | Confirmed library; exam-time tables may be reserved for law students |
| `asian` | Asian Library | Library | [UBC Asian Library history](https://asian.library.ubc.ca/history-and-development/), [hours](https://hours.library.ubc.ca/) | Ground floor reorganized as a study space in 2024 |
| `xwi7xwa` | X̱wi7x̱wa Library | Library | [2026 UBC branch announcement](https://xwi7xwa.library.ubc.ca/news/), [branch address](https://xwi7xwa.library.ubc.ca/contacts/) | Welcomes students and community visitors to study; small, quiet space |
| `hennings` | Hennings — 2nd Floor Hallways | Informal zone | [UBC Learning Spaces](https://learningspaces.ubc.ca/classrooms/henn-2nd-floor-hallways/) | UBC documents 62 informal seats, lamps, outlets, individual and group work |
| `edc` | Engineering Design Centre — Study Areas | Informal zone | [UBC Learning Spaces](https://learningspaces.ubc.ca/classrooms/edc-various-informal-learning-spaces/), [UBC campus planning](https://planning.ubc.ca/wayne-and-william-white-engineering-design-centre-edc) | UBC lists multiple informal study areas at 2345 East Mall |

## Approximate coordinates

Coordinates for the library entries and the renamed Education Learning Commons come from the [UBC Wiki library branch map](https://wiki.prod.apps.ctlt.ubc.ca/Library). The Hennings coordinate comes from its [UBC Wiki building page](https://wiki.prod.apps.ctlt.ubc.ca/Hennings_Building). The EDC centre coordinate is approximated from [OpenStreetMap / Mapcarta](https://mapcarta.com/W150420271) with its building address corroborated by UBC Campus Planning. Existing Nest, Life and ICICS coordinates are retained from [prior map data](MAP_DATA.md) and should be field-checked before wider rollout.

Map latitude/longitude should be verified against the actual public entrance during an on-campus walkthrough. Approximate coordinates are acceptable for finding a building but are not accurate indoor directions.

## Deliberately not implemented

- **Opening hours as static values or live "Open now"** — UBC schedules change for holidays, exams and special events. Check [UBC Library's live hours](https://hours.library.ubc.ca/) or the venue's own source link.
- **Noise, power, seating capacities, access restrictions as generic tags** — unavailable or unevenly verified for most places. Only documented facts appear in individual notes.
- **Separate room-level pins for Chapman, MAA, Nest reservable rooms, etc.** — overlapping pins could mislead people into believing those rooms share the same free-seating status. Add them once zones/booking policies are modelled explicitly.
- **Off-campus Biomedical Branch** — outside the core UBC Point Grey discovery area.

## Further verification before campus beta

1. Visit Education Learning Commons to confirm **2026–27** access and available study seating.
2. Check ICICS for a publicly accessible walk-in zone, or remove its listing from reporting.
3. Walk to EDC and Hennings seating areas to verify entrances, signage and access after class hours.
4. Verify accessibility routes, noise categories and outlet counts in person before displaying them as filters.
5. Consider adding official floor-specific zones with clear reporting scopes rather than multiplying generic building pins.
