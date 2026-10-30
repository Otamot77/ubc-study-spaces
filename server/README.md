# Study Spaces reporting API

Zero runtime npm dependencies: Node.js 24.15+ built-in `node:sqlite` and `node:http`.

## Run locally

```powershell
cd C:\Users\andre\ubc-study-spaces\server
npm run dev
```

The server binds to `127.0.0.1:8787` on your laptop. Vite proxies `/api` requests from the frontend to it; your phone continues using the frontend's Network URL.

The SQLite database is created automatically at `server/data/study-spaces.sqlite`. It is ignored by Git. Reports persist after restarts. Override with `STUDY_SPACES_DB_PATH`.

## Endpoints

- `GET /api/health` — service health
- `GET /api/spaces` — eight real, approximate building locations and their aggregated recent reports
- `POST /api/spaces/:id/reports` — JSON `{"level":"low"|"moderate"|"high"}`; returns 201 and a one-time report ID + private edit token
- `PATCH /api/spaces/:id/reports/:reportId` — JSON `{"level":"low"|"moderate"|"high"|null,"editToken":"..."}` to update or revoke the **same report** for two minutes after submission (maximum five changes); 200 on success, 409 if authorization fails or the window expires

The UI submits on the first tap. Tapping the already-selected option again **revokes the report's vote**, so it disappears from occupancy counts; tapping a different option selects or changes it. A revoked report can be restored within the same two-minute correction window with the same private token, without bypassing the initial submission cooldown or double-counting. The edit token is held only in the active form, not in browser storage. Older reports are migrated automatically when the API starts. Correcting a vote never changes its original timestamp or extends its 45-minute lifetime.

After 45 minutes without recent reports, status becomes **unknown**. A two-way tie also returns unknown. The response includes report count, freshness, and coarse confidence.

## Limits and privacy

This is a **local development prototype**, not a deploy-ready public reporting service. It does not authenticate students, confirm they are on campus, or guarantee accuracy. Cooldown is in-memory per network IP (30 seconds per space, 20 reports per hour). This is a light deterrent, not a security boundary; shared campus NATs could experience collisions and restarts reset cooldowns. Raw IP addresses are never written to the SQLite reports table.

Use `npm test` for aggregation, TTL, validation, and HTTP integration tests. Protect public deployment with trusted proxy configuration, authenticators or abuse controls, HTTPS, and a production database/backup plan.

## HTTPS pilot configuration

On a production container, set `BETA_REPORT_CODE` (minimum 12 characters) and `STUDY_SPACES_DB_PATH` on a persistent volume. Production startup fails if either is missing. `GET /api/config` returns `{"betaAccessRequired":true}`. A protected `POST` or `PATCH` must include header `X-Study-Spaces-Access` with the invite code, or the API returns 403. The frontend asks pilot testers for this code only when the server requires it, and keeps it only in active app memory. It is **not** authentication suitable for public anonymous usage.

The same Node process serves the compiled frontend under `STATIC_DIR` in production, allowing browser GPS over the host's HTTPS URL. `PORT` and `HOST` can be set by the platform. See [deployment guide](../docs/DEPLOYMENT.md).
