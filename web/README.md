# Study Spaces — frontend

A mobile-first React + TypeScript app for UBC Study Spaces Finder. The UI is connected to a local SQLite-backed API rather than fictional occupancy fixtures.

## Run locally (two PowerShell windows)

**Window 1 — backend:**

```powershell
cd C:\Users\andre\ubc-study-spaces\server
npm run dev
```

**Window 2 — frontend:**

```powershell
cd C:\Users\andre\ubc-study-spaces\web
npm ci
npm run dev -- --host 0.0.0.0
```

The phone uses Vite's Network URL, e.g. `http://10.0.0.94:5173/`. The Vite dev server proxies `/api` to `127.0.0.1:8787`. **Both terminals must remain running.**

Requires Node.js 24.15+ to run the backend's built-in SQLite implementation. Your Node.js 26 installation works.

## Commands

```sh
npm run build
npm test
npm run preview
```

## Working features

- Fixed app header and navigation; independent list scrolling
- Interactive eight-building UBC map with two-tone markers
- Live-retrieved occupancy from `GET /api/spaces`, automatically refreshed every 30 seconds
- One-tap report selections POST to the backend; tap the selected choice again to **unselect and revoke its vote**, or tap a different choice to correct it. Changes use PATCH on the same report within two minutes, without duplicate votes.
- Persistent reports, 45-minute expiry, conflicting-report tie handling, and coarse confidence labels
- Basic backend abuse cooldown (see [API documentation](../server/README.md))
- Location-based discovery: search campus buildings by name/abbreviation and choose a starting point, or explicitly request browser GPS where HTTPS is available
- Map camera button: recenter on the chosen GPS/manual starting point; when none is set, the button opens the location picker
- Closest sorts by approximate **straight-line geographic distance**; list, detail, and map preview show distance in metres/km
- Your starting point stays in browser memory, never sent to the report API or stored in SQLite
- External Google Maps walking-directions links

## Honest limits

All buildings have genuine **approximate coordinates**, not verified study-zone entrances. No sample crowding is seeded: without reports, occupancy is Unknown. Reports are anonymous and unverified, so they are not guaranteed to represent actual available seating. Walking time is **not yet calculated**. Closest is enabled once you select a starting point; distances are straight-line approximations, not walking distances or travel-time predictions. Recommended is currently a transparent baseline based on crowding level, confidence, and a curated fallback order—not a personalization algorithm.

The SQLite database exists only on the laptop running the API. Other phones on the same local network can report through Vite, but there is **no public backend deployment**, student verification, production anti-spam protection, GPS, push notifications, or installable PWA yet. The app deliberately shows an offline state when the API is not running rather than fabricated occupancy.

The map uses low-contrast OpenStreetMap tiles with attribution; follow [OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/). A production map provider will need separate evaluation.

## Testing browser location on a phone

Manual campus starting points work over the existing local Wi-Fi HTTP Vite URL. Browser GPS usually requires **HTTPS** on phones; `http://localhost` is a special secure-context exception on the laptop, not on a phone browsing your laptop's IP. The app does not automatically request permission. If GPS is unavailable, the manual picker remains usable.

Select **From → Choose starting point** or tap **Closest**, choose a building, and verify that the list reorders. On Map, the small blue marker shows your chosen starting point, separate from occupancy symbols. Clearing the origin removes distances and returns to Recommended. No reverse geocoding or route API is needed.
