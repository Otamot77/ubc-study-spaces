# Study Spaces — frontend

A minimal, mobile-first **React + TypeScript** interface prototype for UBC Study Spaces Finder, powered by Vite and Tailwind CSS.

## Prerequisites

Node.js 20.19+ (or 22.12+) and npm.

## Run locally

```sh
cd web
npm install
npm run dev
```

Visit the local address printed by Vite (typically http://localhost:5173).

## Commands

```sh
npm run build       # TypeScript check + production bundle
npm test            # Sorting unit tests
npm run preview     # Preview the production bundle
```

## What's implemented

- Responsive, list-first home screen
- Compact study-space cards with walking time and busyness labels
- Demo sorting: Recommended / Least busy / Closest
- One-tap List / Map mode switch (map is currently a **placeholder**)
- Expandable cards with working Google Maps directions links
- Clickable **reporting interface preview only** (nothing is sent or stored)

## Important limits

**Every walking time, busyness label, freshness indicator, report count, and recommendation rank is fictional.** This prototype does not request live location, draw a real map, use an API/database, or send reports. The app is not yet a PWA (no manifest or service worker).

The mock dataset lives in `src/data/studySpaces.ts`. The sorting logic is in `src/lib/sortStudySpaces.ts`.

## Next milestones

Validate mobile presentation, add verified campus data and optional geolocation, implement the real map, then build an API and persistent occupancy reporting.
