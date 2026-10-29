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
