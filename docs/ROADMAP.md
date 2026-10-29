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
- [x] Validate mobile scrolling, sheets, map markers and zoom on a real phone

## 2. Location and map
- [ ] Curate and verify a small UBC study-zone dataset
- [ ] Ask for location permission only when useful; manual fallback
- [ ] Distance sorting using real position (mock sorting exists)
- [x] Real interactive map with sourced building-level pins and selection sync
- [ ] Real walking-time estimates (later; first prototype uses Google Maps for external navigation)
- [x] Google Maps external directions (first prototype)

## 3. Working reporting backend
- [x] Persistent local SQLite database schema and reporting API
- [x] One-tap crowd reports connected to local API
- [x] Recent-report display, 45-minute expiry and unknown/tie states
- [x] Backend integration tests and frontend build/test CI\n- [ ] Public deployment and durable hosted database

## 4. Reporting quality
- [x] Basic 45-minute window and conflicting-report tie logic\n- [ ] More robust recency weighting and disagreement metrics
- [x] Prototype IP rate limiter\n- [ ] Hardened production abuse controls and duplicate suppression
- [x] Basic confidence signalling and aggregation tests
- [x] CI for frontend and backend; visible offline/submission errors

## 5. Engagement and evaluation
- [ ] Optional delayed Web Push reminders after navigation
- [ ] Small student pilot and feedback
- [ ] Evaluate report participation and accuracy

## Later, only if justified by evidence
- [ ] Historical busyness predictions
- [ ] Preference-aware recommendations
- [ ] Expand study zones

**Milestone rule:** Don't claim a feature is completed until it is implemented and tested.
