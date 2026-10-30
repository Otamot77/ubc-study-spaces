# Controlled HTTPS beta deployment

**Status:** The repository is deployable as a container. No hosting service or public domain has been provisioned yet.

## Architecture

A single Node.js 24 container serves both:
- built React/Vite static assets at `/`
- `/api/health`, `/api/config`, `/api/spaces`, and protected report endpoints under `/api/`

The database is SQLite on an attached persistent volume. Same-origin requests mean no cross-origin API setup. An HTTPS hosting domain unlocks opt-in browser GPS on compatible phones.

**Important:** This is a limited invite-code beta, not a public launch. Crowd reports are anonymous and unverified. The simple network-IP rate limiter is still unsuitable for a large campus rollout.

## Suggested deployment via Railway

1. In Railway, choose **New Project → Deploy from GitHub repo** and grant access to `Otamot77/ubc-study-spaces`. Keep its root directory at repository root so it finds `Dockerfile`.
2. Under the service's **Volumes**, attach a persistent volume mounted at `/data`. Enable its available backup/snapshot option, and document your recovery process before inviting testers.
3. Under **Variables**, set the two required values:
   - `STUDY_SPACES_DB_PATH=/data/study-spaces.sqlite`
   - `BETA_REPORT_CODE=<a unique random code of at least 12 characters>` (generate locally; never commit it or share it publicly)
4. Keep **one replica** because SQLite is stored on a volume associated with one instance. Docker sets `NODE_ENV=production`, `HOST=0.0.0.0`, and `STATIC_DIR=/app/public`. The service honours the platform's `PORT`.
5. Configure deployment **Healthcheck Path** as `/api/health`.
6. Once logs and health checks pass, choose **Generate Domain** under **Networking**. Railway manages HTTPS for its generated domain. No custom domain is necessary yet.
7. Visit the HTTPS URL, confirm the list/map load, and test **Use my location** (permission remains opt-in). Report submission should require the private beta invite code, while the list and map remain readable without it.
8. Run a short pilot with trusted friends; check report counts, rate-limit behaviour, volume persistence after restarting the service, and backups. Monitor usage charges before sharing the link more widely.

**Costs:** Railway may charge for running resources and volume storage. See its current [pricing](https://railway.com/pricing) before deploying; this repository does not create any charge by itself.

## Fail-closed production startup

The container refuses to start if any of the following is missing:
- a beta access code at least 12 characters long
- `STUDY_SPACES_DB_PATH` pointing to your mounted volume
- the compiled frontend in `STATIC_DIR`

Do **not** remove these checks or deploy the old anonymous local API to an unrestricted public URL. Beta code only controls writes; site viewing remains public. Treat the code as a shared pilot secret, **not strong authentication**.

## Local developer setup stays the same

```powershell
# PowerShell A
cd server
npm run dev

# PowerShell B
cd web
npm ci
npm run dev -- --host 0.0.0.0
```

The dev API runs without a beta code unless you explicitly set `BETA_REPORT_CODE`. The Vite proxy forwards `/api` to `127.0.0.1:8787`.

## Validate the production container locally

Requires Docker Desktop.

```powershell
docker build -t ubc-study-spaces .
docker volume create study-spaces-test-data
docker run --rm -p 8787:8787 `
  -e BETA_REPORT_CODE=your-local-test-code `
  -e STUDY_SPACES_DB_PATH=/data/study-spaces.sqlite `
  -v study-spaces-test-data:/data `
  ubc-study-spaces
```

Then open `http://localhost:8787` and `http://localhost:8787/api/health`. Stop the container with Ctrl+C. **Don't use a real shared invite code for local screenshots or recordings.**

## Before broader release

- Replace shared beta code with individual student identity or signed short-lived reporter sessions, plus abuse controls that work with trusted proxy IPs.
- Improve retention/deletion policy, confidence estimation, and data accuracy through pilot feedback.
- Verify precise study-zone locations, accessibility and current opening hours.
- Monitor uptime, resource costs and volume backups; test restore.
- Review OpenStreetMap tile usage limits and select a production tile provider.
- Add a true hosted deployment test for both Android and iOS GPS and browsers.

