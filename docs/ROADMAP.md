# Development roadmap

This is a working plan, not a fixed commitment. Each milestone should produce a small, reviewable change.

## 0. Foundation
- [x] Initialize repo and project documentation
- [ ] Capture initial UI sketches and choose MVP boundaries
- [ ] Choose frontend/backend stack based on requirements

## 1. Mobile-first discovery prototype
- [ ] Scaffold frontend
- [ ] Study-space list using clearly labelled mock data
- [ ] Basic sorting and accessible states
- [ ] Iterate on phone-size UI

## 2. Location and map
- [ ] Curate and verify a small UBC study-zone dataset
- [ ] Ask for location permission only when useful; manual fallback
- [ ] Distance sorting and optional map
- [ ] Walking-time estimates and external directions

## 3. Working reporting backend
- [ ] Database schema and API
- [ ] One-tap crowd reports
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
