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

- Fixed compact header and List / Map toggle; sorting controls appear only in List mode
- **Only the list scrolls**; bottom Explore / Report navigation stays pinned
- Compact tappable cards launch a details bottom sheet
- Details sheet provides external Google Maps directions and a reporting preview
- Report tab launches a three-choice reporting sheet with a location selector
- Map mode shows all eight building pins on a visually simplified OpenStreetMap basemap; selecting a marker recentres it above a small detail preview

The details and report sheets support Escape to close, backdrop dismissal, and keyboard focus cycling. Animations are disabled when reduced motion is preferred.

## Data and feature limits

Building marker coordinates are approximate published **real locations** (see [map data sources](../docs/MAP_DATA.md)). All crowd reports, walking times, and recommendation rankings are **fictional**. Individual study zones, access and entrances have not been verified.

The prototype visually mutes standard OpenStreetMap tiles to reduce label clutter without a proprietary map API key. The map uses the community-hosted OpenStreetMap tile server for modest development, not guaranteed production use. It requires internet and has usage restrictions; use a suitable provider before public launch. Override its URL with `VITE_MAP_TILE_URL` when appropriate. There is no real GPS, pedestrian routing API, report persistence, login, backend, notification system, or PWA service worker yet. Report selections are on-screen previews only. This is not an occupancy service.

The sample dataset lives in `src/data/studySpaces.ts`. Sorting is implemented in `src/lib/sortStudySpaces.ts`.

## Next step

Test all map markers on a real phone, including List / Map selection sync. Next: optional browser location, real pedestrian routing, and genuine occupancy services.
