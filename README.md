# UBC Study Spaces

A mobile-first study-space finder for students at UBC Vancouver.

**Core question:** Where can I find a good study spot right now?

The React frontend and Node.js/SQLite reporting API now form a **working local prototype** with 13 curated UBC locations. Students can select a building, submit a one-tap crowding report, and see its status update in the list and map. Reports persist across API restarts and age out after 45 minutes. With no recent reports, the status is always **Unknown**.

## Run it locally

Requires Node.js **24.15+** (Node 26 works), npm, and two terminals.

Terminal A:

```powershell
cd server
npm run dev
```

Terminal B:

```powershell
cd web
npm ci
npm run dev -- --host 0.0.0.0
```

Open the printed frontend Network URL on a phone connected to the same Wi-Fi. Vite proxies API requests to the local backend.

## Tests

```sh
cd server && npm test
cd ../web && npm run build && npm test
```

## Limits

This remains a **local proof of concept**, not a public occupancy service or a deployed PWA. A Docker-based controlled-beta deployment is now prepared, but not deployed. Building positions are approximate; crowdsourced occupancy is unverified. Walking-time estimates, personalization, production security/abuse prevention and hosted database are not implemented yet. Google Maps handles directions externally.

See [frontend instructions](web/README.md), [API instructions](server/README.md), [local two-device test guide](docs/LOCAL_TESTING.md), [deployment instructions](docs/DEPLOYMENT.md), and [development roadmap](docs/ROADMAP.md).

## Documentation

- [Product vision](docs/PRODUCT.md)
- [Map data sources](docs/MAP_DATA.md)
- [Verified study-space research and access caveats](docs/STUDY_SPACE_DATA.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)

## HTTPS pilot preparation

A single Dockerfile now serves the frontend and API on one origin, with optional beta-code-protected reporting and a required persistent SQLite volume in production. [Deployment instructions](docs/DEPLOYMENT.md) explain how to connect hosting and conduct a controlled phone pilot; nothing has been published yet.
