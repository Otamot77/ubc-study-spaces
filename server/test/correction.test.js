import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { addReport, correctReport, CORRECTION_MS, occupancy, openDatabase } from '../src/db.js'

test('correcting a report replaces its vote and preserves freshness and count', () => {
  const db = openDatabase(':memory:')
  try {
    const now = 1_000_000
    const { reportId, editToken } = addReport(db, 'koerner', 'low', now)
    assert.ok(reportId > 0)
    assert.equal(editToken.length, 43)
    assert.equal(correctReport(db, 'koerner', reportId, editToken, 'high', now + 60_000), true)
    const result = occupancy(db, 'koerner', now + 60_000)
    assert.equal(result.busyness, 'high')
    assert.equal(result.recentReportCount, 1)
    assert.equal(result.latestReportMinutesAgo, 1)
  } finally { db.close() }
})

test('expired, forged, cross-space and repeated edits are rejected', () => {
  const db = openDatabase(':memory:')
  try {
    const now = 1_000_000
    const { reportId, editToken } = addReport(db, 'ikb', 'moderate', now)
    assert.equal(correctReport(db, 'nest', reportId, editToken, 'high', now), false)
    assert.equal(correctReport(db, 'ikb', reportId, 'not-a-token', 'high', now), false)
    assert.equal(correctReport(db, 'ikb', reportId, editToken, 'high', now + CORRECTION_MS + 1), false)
    for (let i = 0; i < 5; i++) {
      assert.equal(correctReport(db, 'ikb', reportId, editToken, 'low', now + i + 1), true)
    }
    assert.equal(correctReport(db, 'ikb', reportId, editToken, 'high', now + 10), false)
    assert.equal(occupancy(db, 'ikb', now + 10).recentReportCount, 1)
  } finally { db.close() }
})

test('migrates pre-existing databases without deleting reports', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-spaces-migration-'))
  const path = join(dir, 'old.sqlite')
  try {
    const old = new DatabaseSync(path)
    old.exec(`
      CREATE TABLE reports (
        id INTEGER PRIMARY KEY,
        space_id TEXT NOT NULL,
        level TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      INSERT INTO reports (space_id, level, created_at)
        VALUES ('koerner', 'low', 1000000);
    `)
    old.close()
    const db = openDatabase(path)
    try {
      assert.equal(occupancy(db, 'koerner', 1_000_100).busyness, 'low')
      const fresh = addReport(db, 'koerner', 'high', 1_000_101)
      assert.equal(correctReport(db, 'koerner', fresh.reportId, fresh.editToken, 'moderate', 1_000_200), true)
      assert.equal(occupancy(db, 'koerner', 1_000_201).recentReportCount, 2)
    } finally { db.close() }
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('tapping selected status again revokes the vote; tapping another status restores one vote', () => {
  const db = openDatabase(':memory:')
  try {
    const now = 1_000_000
    const { reportId, editToken } = addReport(db, 'koerner', 'low', now)
    assert.equal(occupancy(db, 'koerner', now).recentReportCount, 1)
    assert.equal(correctReport(db, 'koerner', reportId, editToken, null, now + 1_000), true)
    assert.deepEqual(occupancy(db, 'koerner', now + 1_000), {
      busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, confidence: 'none',
    })
    assert.equal(correctReport(db, 'koerner', reportId, editToken, 'high', now + 2_000), true)
    const restored = occupancy(db, 'koerner', now + 2_000)
    assert.equal(restored.busyness, 'high')
    assert.equal(restored.recentReportCount, 1)
    assert.equal(restored.latestReportMinutesAgo, 0)
  } finally { db.close() }
})

test('revoked reports survive restart without counting towards occupancy', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-spaces-revoke-'))
  const path = join(dir, 'reports.sqlite')
  try {
    const db = openDatabase(path)
    const now = 1_000_000
    const { reportId, editToken } = addReport(db, 'ikb', 'moderate', now)
    assert.equal(correctReport(db, 'ikb', reportId, editToken, null, now + 1), true)
    db.close()
    const reopened = openDatabase(path)
    try {
      assert.equal(occupancy(reopened, 'ikb', now + 2).recentReportCount, 0)
    } finally { reopened.close() }
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
