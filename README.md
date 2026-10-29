# UBC Study Spaces

A mobile-first study-space finder for students at UBC Vancouver.

**Core question:** Where can I find a good study spot right now?

## Vision

Open the app, see nearby study spaces, compare **recently reported** busyness and walking distance, and choose where to go. Students can contribute quick crowd reports. The interface should be simpler than a traditional campus directory.

A lack of recent reports means **unknown**, never "empty."

## Frontend prototype

The first **React + TypeScript** UI prototype is now in [`web/`](web/). It has compact cards, demo sorting, a List / Map toggle, and a reporting interaction preview.

```sh
cd web
npm install
npm run dev
```

See [frontend instructions](web/README.md) for build and test commands.

**Important:** All displayed walking times, crowding levels, report counts, and rankings are **fictional sample data**. The map is a placeholder; real location and reporting services are not connected. This is not yet a deployed PWA.

## Proposed MVP (subject to change)

- Mobile-first list of curated study spaces
- Optional location-based discovery, with manual fallback
- Sorting by distance, reported busyness, or recommendations
- One-tap reports: plenty of seats / some seats / almost full
- Honest timestamps and handling of stale or conflicting reports
- Persistent backend and automated tests

## Documentation

- [Product vision](docs/PRODUCT.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
