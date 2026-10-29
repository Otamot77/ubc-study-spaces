# Development roadmap

This is a working plan, not a fixed commitment. Each milestone should produce a small, reviewable change.

## 0. Foundation
- [x] Initialize repo and project documentation
- [x] Agree on list-first UI, full-screen map alternative, and compact cards
- [x] Choose initial React + TypeScript frontend stack (backend open)

## 1. Mobile-first discovery prototype
- [x] Scaffold frontend
- [x] Study-space list using clearly labelled mock data
- [x] Basic sorting and accessible states (pending device testing)
- [x] Refactor to fixed app shell, separate list scrolling, and bottom sheets
- [ ] Validate the revised experience on a real phone

## 2. Location and map
- [ ] Curate and verify a small UBC study-zone dataset
- [ ] Ask for location permission only when useful; manual fallback
- [ ] Distance sorting using real position (mock sorting exists)
- [x] Real interactive map with sourced building-level pins and selection sync
- [ ] Real walking-time estimates (later; first prototype uses Google Maps for external navigation)
- [ ] External directions (prototype links exist)

## 3. Working reporting backend
- [ ] Database schema and API
- [ ] One-tap crowd reports (UI-only preview exists)
- [ ] Recent-report display and stale/unknown states
- [ ] Basic automated tests and public deployment

## 4. Reporting quality
- [ ] Recency weighting and conflicting-report logic
- [ ] Rate limits and duplicate suppression
- [ ] Confidence signalling and aggregation tests
- [ ] CI and graceful error handling

## 5. Engagement and evaluation
- [ ] Optional delayed Web Push reminders after navigation
- [ ] Small student pilot and feedback
- [ ] Evaluate report participation and accuracy

## Later, only if justified by evidence
- [ ] Historical busyness predictions
- [ ] Preference-aware recommendations
- [ ] Expand study zones

**Milestone rule:** Don't claim a feature is completed until it is implemented and tested.
