import { createServer } from 'node:http'
import { createHash, timingSafeEqual } from 'node:crypto'
import { serveStatic } from './static.js'
import { addReport, correctReport, occupancy, WINDOW_MS, CORRECTION_MS } from './db.js'
import { spaceIds, spaces } from './spaces.js'

const VALID_LEVELS = new Set(['low', 'moderate', 'high'])
const MAX_BODY_BYTES = 2048

/** Shared beta invite code, intentionally not a substitute for user accounts. */
export function createBetaAccessVerifier(betaCode) {
  if (!betaCode) return () => true
  const expected = createHash('sha256').update(betaCode, 'utf8').digest()
  return (submitted) => {
    if (typeof submitted !== 'string' || submitted.length > 256) return false
    const actual = createHash('sha256').update(submitted, 'utf8').digest()
    return timingSafeEqual(expected, actual)
  }
}

function json(res, status, data, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...extraHeaders,
  })
  res.end(JSON.stringify(data))
}

async function readJson(req) {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    const err = new Error('Expected application/json')
    err.status = 415
    throw err
  }
  let total = 0
  const chunks = []
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY_BYTES) {
      const err = new Error('Request body too large')
      err.status = 413
      throw err
    }
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  catch {
    const err = new Error('Invalid JSON')
    err.status = 400
    throw err
  }
}

/**
 * Simple in-memory IP cooldown: local prototype only.
 * Deliberately ignores spoofable X-Forwarded-For and never writes IPs to SQLite.
 */
export function createRateLimiter() {
  const byIp = new Map()
  return function allow(ip, spaceId, now) {
    const active = (byIp.get(ip) || []).filter((entry) => now - entry.at < 3_600_000)
    // Shared campus NATs can collide: this is a prototype restriction, not
    // a secure identity or production-level spam prevention system.
    const lastSameSpace = active.findLast((entry) => entry.spaceId === spaceId)
    if (active.length >= 20 || (lastSameSpace && now - lastSameSpace.at < 30_000)) {
      byIp.set(ip, active)
      return false
    }
    active.push({ spaceId, at: now })
    byIp.set(ip, active)
    if (byIp.size > 5000) {
      for (const [key, entries] of byIp) {
        if (entries.every((entry) => now - entry.at >= 3_600_000)) byIp.delete(key)
      }
    }
    return true
  }
}

export function makeServer({
  db, clock = () => Date.now(), limiter = createRateLimiter(),
  betaCode = process.env.BETA_REPORT_CODE || null,
  staticDir = process.env.STATIC_DIR || null,
}) {
  const verifyAccess = createBetaAccessVerifier(betaCode)
  return createServer(async (req, res) => {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    try {
      if (req.method === 'GET' && pathname === '/api/health') {
        return json(res, 200, { ok: true })
      }
      if (req.method === 'GET' && pathname === '/api/config') {
        return json(res, 200, { betaAccessRequired: Boolean(betaCode) })
      }
      if (req.method === 'GET' && pathname === '/api/spaces') {
        const now = clock()
        return json(res, 200, {
          spaces: spaces.map((space) => ({
            ...space,
            walkingMinutes: null,
            ...occupancy(db, space.id, now),
          })),
          windowMinutes: WINDOW_MS / 60_000,
          updatedAt: new Date(now).toISOString(),
        })
      }
      const reportMatch = /^\/api\/spaces\/([a-z0-9-]+)\/reports$/.exec(pathname)
      if (req.method === 'POST' && reportMatch) {
        if (!verifyAccess(req.headers['x-study-spaces-access'])) {
          return json(res, 403, { error: 'Beta access code required or incorrect.' })
        }
        const spaceId = reportMatch[1]
        if (!spaceIds.has(spaceId)) return json(res, 404, { error: 'Unknown study space' })
        const body = await readJson(req)
        if (!body || typeof body !== 'object' || Array.isArray(body) ||
            Object.keys(body).length !== 1 || !VALID_LEVELS.has(body.level)) {
          return json(res, 400, { error: 'Expected { "level": "low" | "moderate" | "high" }' })
        }
        const now = clock()
        const ip = req.socket.remoteAddress || 'unknown'
        if (!limiter(ip, spaceId, now)) {
          return json(res, 429, { error: 'Too many reports. Try again shortly.' }, { 'Retry-After': '30' })
        }
        const { reportId, editToken } = addReport(db, spaceId, body.level, now)
        return json(res, 201, {
          saved: true, spaceId, reportId, editToken,
          editableUntil: new Date(now + CORRECTION_MS).toISOString(),
          ...occupancy(db, spaceId, now),
        })
      }
      const correctionMatch = /^\/api\/spaces\/([a-z0-9-]+)\/reports\/([1-9][0-9]*)$/.exec(pathname)
      if (req.method === 'PATCH' && correctionMatch) {
        if (!verifyAccess(req.headers['x-study-spaces-access'])) {
          return json(res, 403, { error: 'Beta access code required or incorrect.' })
        }
        const [, spaceId, reportIdText] = correctionMatch
        const reportId = Number(reportIdText)
        if (!spaceIds.has(spaceId) || !Number.isSafeInteger(reportId)) {
          return json(res, 404, { error: 'Report not found' })
        }
        const body = await readJson(req)
        if (!body || typeof body !== 'object' || Array.isArray(body) ||
            Object.keys(body).length !== 2 || (body.level !== null && !VALID_LEVELS.has(body.level)) ||
            typeof body.editToken !== 'string') {
          return json(res, 400, { error: 'Expected low, moderate, high, or null, plus an edit token' })
        }
        const now = clock()
        if (!correctReport(db, spaceId, reportId, body.editToken, body.level, now)) {
          return json(res, 409, { error: 'Could not change this report. The correction window may have expired.' })
        }
        return json(res, 200, {
          saved: body.level !== null, corrected: true, revoked: body.level === null,
          spaceId, reportId, ...occupancy(db, spaceId, now),
        })
      }
      if (staticDir && req.method === 'GET' && !pathname.startsWith('/api/')) {
        if (await serveStatic(req, res, staticDir)) return
      }
      if (!['GET', 'POST', 'PATCH'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, POST, PATCH' })
      return json(res, 404, { error: 'Not found' })
    } catch (err) {
      if (err.status) return json(res, err.status, { error: err.message })
      console.error('Request failed:', err)
      return json(res, 500, { error: 'Internal server error' })
    }
  })
}
