import { DatabaseSync } from 'node:sqlite'
import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const WINDOW_MS = 45 * 60_000
export const CORRECTION_MS = 2 * 60_000
const DEFAULT_PATH = fileURLToPath(new URL('../data/study-spaces.sqlite', import.meta.url))
const VALID_LEVELS = new Set(['low', 'moderate', 'high'])

export function openDatabase(path = process.env.STUDY_SPACES_DB_PATH || DEFAULT_PATH) {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true })
  const db = new DatabaseSync(path, { timeout: 5000 })
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY,
      space_id TEXT NOT NULL,
      level TEXT NOT NULL CHECK (level IN ('low', 'moderate', 'high')),
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reports_space_time
      ON reports(space_id, created_at DESC);
  `)
  // Backward-compatible migration for laptops with reports from the first API version.
  const columns = db.prepare('PRAGMA table_info(reports)').all()
  if (!columns.some((col) => col.name === 'edit_token_hash')) {
    db.exec('ALTER TABLE reports ADD COLUMN edit_token_hash TEXT')
  }
  if (!columns.some((col) => col.name === 'edit_count')) {
    db.exec('ALTER TABLE reports ADD COLUMN edit_count INTEGER NOT NULL DEFAULT 0')
  }
  if (!columns.some((col) => col.name === 'revoked')) {
    db.exec('ALTER TABLE reports ADD COLUMN revoked INTEGER NOT NULL DEFAULT 0')
  }
  return db
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function addReport(db, spaceId, level, now = Date.now()) {
  if (!VALID_LEVELS.has(level)) throw new TypeError('Invalid report level')
  const editToken = randomBytes(32).toString('base64url')
  const result = db.prepare(
    'INSERT INTO reports(space_id, level, created_at, edit_token_hash) VALUES (?, ?, ?, ?)'
  ).run(spaceId, level, now, tokenHash(editToken))
  return { reportId: Number(result.lastInsertRowid), editToken }
}

/**
 * A bearer edit token may change only its own report, no later than two
 * minutes after submission. Passing null revokes the vote without removing
 * its edit token, so the reporter can reselect within that same window.
 * Changes preserve the original timestamp and never add a duplicate vote.
 */
export function correctReport(db, spaceId, reportId, editToken, level, now = Date.now()) {
  if (level !== null && !VALID_LEVELS.has(level)) throw new TypeError('Invalid report level')
  if (!Number.isSafeInteger(reportId) || reportId < 1) return false
  if (typeof editToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(editToken)) return false
  const result = db.prepare(`
    UPDATE reports
    SET level = COALESCE(?, level), revoked = ?, edit_count = edit_count + 1
    WHERE id = ? AND space_id = ? AND edit_token_hash = ?
      AND created_at >= ? AND created_at <= ? AND edit_count < 5
  `).run(level, level === null ? 1 : 0, reportId, spaceId, tokenHash(editToken), now - CORRECTION_MS, now)
  return result.changes === 1
}

export function occupancy(db, spaceId, now = Date.now()) {
  const rows = db.prepare(
    'SELECT level, created_at FROM reports WHERE space_id = ? AND revoked = 0 AND created_at > ? AND created_at <= ? ORDER BY created_at DESC LIMIT 300'
  ).all(spaceId, now - WINDOW_MS, now)

  if (!rows.length) {
    return { busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, confidence: 'none' }
  }

  const counts = { low: 0, moderate: 0, high: 0 }
  for (const row of rows) counts[row.level]++
  const maxVotes = Math.max(...Object.values(counts))
  const winners = Object.keys(counts).filter((level) => counts[level] === maxVotes)
  // Disagreement without a majority is explicitly unknown, not guessed.
  const busyness = winners.length === 1 ? winners[0] : 'unknown'
  const confidence = busyness === 'unknown' || rows.length < 3
    ? 'low' : rows.length < 5 || maxVotes / rows.length < 0.7 ? 'medium' : 'high'

  return {
    busyness,
    recentReportCount: rows.length,
    latestReportMinutesAgo: Math.floor((now - rows[0].created_at) / 60_000),
    confidence,
  }
}
