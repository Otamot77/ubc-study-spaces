# Study Spaces — frontend

A mobile-first React + TypeScript interface prototype for UBC Study Spaces Finder, using Vite and Tailwind CSS.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
cd web
npm ci
npm run dev -- --host 0.0.0.0
```

Open the Local URL on your laptop, or the Network URL on a phone connected to the same Wi-Fi. If Windows Firewall prompts, only allow private networks.

## Commands

```sh
npm run build
npm test
npm run preview
```

## Current interaction design

- Fixed compact header, List / Map toggle, and sorting controls
- **Only the list scrolls**; bottom Explore / Report navigation stays pinned
- Compact tappable cards launch a details bottom sheet
- Details sheet provides external Google Maps directions and a reporting preview
- Report tab launches a three-choice reporting sheet with a location selector
- Map view fills the available space but remains a placeholder

The details and report sheets support Escape to close, backdrop dismissal, and keyboard focus cycling. Animations are disabled when reduced motion is preferred.

## Data and feature limits

All displayed crowd reports, walking times, and recommendation rankings are **fictional**. The additional entries are for scrolling and UI testing only; individual study zones and access have not been verified.

There is no real GPS, map, routing API, report persistence, login, backend, notification system, or PWA service worker yet. Report selections are on-screen previews only. This is not an occupancy service.

The sample dataset lives in `src/data/studySpaces.ts`. Sorting is implemented in `src/lib/sortStudySpaces.ts`.

## Next step

Test the mobile UI on a real device before introducing genuine map and occupancy services.
