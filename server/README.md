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
- `POST /api/spaces/:id/reports` — JSON `{"level":"low"|"moderate"|"high"}`; success 201, validation error 400, cooldown 429

After 45 minutes without recent reports, status becomes **unknown**. A two-way tie also returns unknown. The response includes report count, freshness, and coarse confidence.

## Limits and privacy

This is a **local development prototype**, not a deploy-ready public reporting service. It does not authenticate students, confirm they are on campus, or guarantee accuracy. Cooldown is in-memory per network IP (30 seconds per space, 20 reports per hour). This is a light deterrent, not a security boundary; shared campus NATs could experience collisions and restarts reset cooldowns. Raw IP addresses are never written to the SQLite reports table.

Use `npm test` for aggregation, TTL, validation, and HTTP integration tests. Protect public deployment with trusted proxy configuration, authenticators or abuse controls, HTTPS, and a production database/backup plan.
