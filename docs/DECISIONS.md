# Decision log

Record meaningful product and technical decisions here as the project evolves. Keep the reasoning and alternatives, not just the final answer.

## 2026-10-28 — Initial direction

**Status:** Working direction, not a frozen specification.

**Decision:** Prioritize a simple mobile-first busyness finder over a detailed campus directory.

**Why:** The key user question is where to study *now*, rather than browsing a large catalogue of rooms.

**Constraints:** Busyness comes from voluntary reports and may be unknown. Location must be opt-in. The first version should stay small.

## 2026-10-28 — Main screen layout and navigation

**Status:** Accepted design direction; implementation and visual details are still open.

**Decision:** Use a minimal, clean, Apple-like visual style with a **list-first + full-screen map toggle**.

### Primary screen

- Default to a **list of nearby study spaces**, optimized for quick decisions rather than directory browsing.
- Offer a visible **List / Map** toggle that switches views in one tap.
- In Map mode, show a **full-screen interactive map** with study-space markers and a compact floating card for the selected space, not a permanently split half-map/half-list.
- Keep the selected study space, sorting, and filters when switching views; the toggle must not reset the user's context.
- Focus each list card on the **space name, estimated walking time, and current reported busyness**, with report count/freshness as secondary trust information.
- Offer three sorting modes: **Recommended**, **Least busy**, and **Closest**.
- Use a compact detail card or bottom sheet for **Get directions** and **Report busyness** actions.
- Keep one-tap crowd reporting easy to access. Exact report wording and interaction states remain to be refined.

### Visual and data principles

- Prefer generous spacing, subtle borders, restrained colour, and readable system typography.
- Use status labels alongside colour; support **Unknown** when no sufficiently recent report exists.
- Treat crowding as **user-reported observations**, not verified seat counts.
- Keep location permission optional, with a manual location/area fallback.

**Alternatives considered:** Full directory-style map; half-screen map with a scrollable list; recommendation-first landing screen.

**Why:** A list is faster for comparing busyness and walking time; a full-screen map remains easily available for spatial exploration without crowding the default mobile screen.

## 2026-10-28 — Mobile app-style interaction refactor

**Status:** Implemented in frontend prototype, pending phone testing.

**Decision:** Use a viewport-height app shell with a persistent header, sorting controls, and two-button bottom navigation (**Explore / Report**). The study-space list scrolls independently. Cards open a bottom sheet instead of expanding in the page; Report opens a separate one-tap selection preview. Support subtle transitions, accessible focus handling, and reduced-motion preferences.

**Why:** On-phone testing found whole-page scrolling and static interactions made the first version feel like a website, not an app. Content should scroll within the main region while primary controls remain immediately accessible.

**Scope:** No true submissions, locations, crowd estimates, or map integration are implemented. All data is still mock data.

## Open decisions

| Topic | Questions |
| --- | --- |
| Study-space data | Which verified study zones will replace the demo locations? |
| Location | When should location be requested and how does manual selection work? |
| Reports | What age limit, weighting, and confidence rules are appropriate? |
| Identity | Anonymous, pseudonymous, or accounts? |
| Stack | Backend and database choices? |
| Recommendations | What initial, transparent ranking rules should be used? |
| Notifications | Should directions trigger an opt-in reminder after walking time + a grace period? |
| Deployment | Hosting, costs, and maintenance plan? |

## Future entries

Use this template:

### YYYY-MM-DD — Decision title
**Status:** Proposed / Accepted / Revisited

**Choice:** ...

**Alternatives:** ...

**Why:** ...

**Follow-up:** ...

## 2026-10-28 — Simplify map mode after phone feedback

**Status:** Implemented; pending device review.

**Decision:** Hide Recommended / Least busy / Closest in Map mode; they order the list, not geographic markers. All locations remain visible on the map. Start with a campus overview and no selected place unless the user has already picked one. Tap a coloured pin to show a compact ~74px card; tap the card for the existing details bottom sheet. Animate the map centre into the unobstructed area above that card. Keep an intentionally low-contrast, desaturated OpenStreetMap background and visible attribution.

**Why:** The first map obscured too much of the viewport, recentered inadequately, and contained more basemap labels and controls than useful for choosing a study space.

**Constraint:** No CARTO key is configured, so this does not switch to a provider that would display an API-key watermark. Sample crowding and travel times remain explicitly illustrative.

## 2026-10-29 — Brighter occupancy palette and external navigation

**Status:** Accepted for the first prototype; to be reviewed on-device.

**Decision:** Preserve the quiet basemap and simple app layout, but use brighter teal (plenty of seats), amber (some seats), and coral (almost full) markers, plus a neutral slate tone for unknown. The same status categories use darker corresponding text and lightly tinted backgrounds for legibility. Keep navigation through an external Google Maps walking-directions link instead of building in-app turn-by-turn routing.

**Why:** The previous traffic-light palette felt dull, particularly against the intentionally muted basemap. The product's value comes from occupancy discovery, not duplicating a navigation app.

**Limit:** All occupancy levels and walking-minute estimates displayed in this design remain fictional; map coordinates represent approximate real building locations.

## 2026-10-29 — Restore semantic map traffic-light markers

**Status:** Implemented, pending phone review.

**Decision:** Keep the existing tinted status labels in the list and details untouched. On the map specifically, use readily recognizable green (#22c55e), yellow (#facc15), red (#ef4444), and grey (#9ca3af) pins. Use simple solid circles with a white edge and neutral dark selection ring, rather than bright teal/coral colours and a decorative centre dot.

**Why:** Phone testing showed that teal and coral did not communicate the intended good / maybe / bad meanings at a glance. The map should favour intuitive occupancy semantics over novelty, without adding a cluttered legend.

**Scope:** All displayed occupancy is still mock data. Marker colours are a UI convention, not live availability.

## 2026-10-29 — Two-tone marker glyphs and Leaflet anchor fix

**Status:** Implemented, pending phone zoom/pan verification.

**Decision:** Replace solid map dots with pale-tinted circles containing the same four status glyphs used in List view (check, dot, alert, and help). Keep the list styling unchanged. Explicitly restore `position: absolute` for the Leaflet marker DOM nodes; do not use `position: relative` on them. Preserve centered `iconAnchor` and keep the selected marker above others.

**Why:** Solid traffic-light dots felt unfinished, and marker positions appeared to drift away from buildings when zooming out. The custom `.study-pin { position: relative }` rule overrode Leaflet's required absolute marker positioning, a likely cause of the drift.

**Verification:** Regression tests check marker glyphs and CSS positioning; real-device map zoom and pan still need human verification. All busyness values remain illustrative.

## 2026-10-29 — Persistent reports, honest occupancy and local API

**Status:** Implementation in progress, subject to automated tests and phone smoke test.

**Decision:** Use a small Node.js 24.15+ API with its built-in SQLite database and prepared statements. Keep the API bound to local loopback; Vite proxies `/api` for same-Wi-Fi devices. Seed **no fictional occupancy reports**. Report submission is one tap after opening the Report sheet. The visible busyness is a simple 45-minute majority vote with ties Unknown, plus report count/freshness/confidence. Frontend polls periodically and refreshes after submission.

**Why:** Persistence and honest stale/unknown states are the minimum useful full-stack milestone, without requiring a paid hosted database or sign-in.

**Limitations:** Client IP rate limiting is lightweight and shared-IP users can collide behind a proxy. A public launch will require secure deployment, database backups, anti-abuse measures, and student validation. GPS and walking-time estimation are deferred; external Google Maps directions remain.

## 2026-10-29 — Opt-in location-based discovery

**Status:** Implemented in frontend, pending on-phone review.

**Decision:** Add one compact “From” selector shared by List and Map. Allow an explicit browser GPS request or choosing a known UBC building manually. All distance calculations happen client-side via the haversine formula, are rounded for display, and are clearly labelled **straight-line distance**, not walking minutes. Closest is activated only after a starting point is chosen. Show a small separate starting-point marker on the map, leaving busyness markers unchanged. Continue opening Google Maps for actual walking routes.

**Privacy:** Keep the origin in React memory only; do not persist the coordinate to browser storage, API, SQLite, or logs.

**Limitations:** Phone geolocation typically requires HTTPS (not a LAN HTTP address). Approximate building coordinates are not precise study-zone entrances. GPS inaccuracy can change ranks over short distances.

## 2026-10-29 — Searchable starting-point picker and map recentering

**Status:** Implemented in the frontend, pending phone UI review.

**Decision:** Add a compact search field to the existing starting-point picker that filters the known campus buildings locally by name or short ID. Show an informative empty state and a clear-query control. Add a small recenter button on the Map screen; when a starting point has been chosen, it moves the camera to that GPS/manual point without changing the selected space. When no starting point exists, it opens the picker instead of silently doing nothing.

**Why:** A growing list of buildings should not require long scrolling, and the map should let users quickly find their own origin again after exploring other pins.

**Constraints:** Recenter does not refresh GPS or ask for location permission. It only uses the already-selected starting point. No coordinates or search terms are sent to the API.
