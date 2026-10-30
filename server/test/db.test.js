import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addReport, correctReport, occupancy, openDatabase, WINDOW_MS } from '../src/db.js'

test('no reports means unknown, not fabricated data', () => {
  const db = openDatabase(':memory:')
  try { assert.deepEqual(occupancy(db, 'koerner', 10_000), {
    busyness: 'unknown', recentReportCount: 0, latestReportMinutesAgo: null, confidence: 'none',
  }) } finally { db.close() }
})

test('reports are counted, with last report freshness and low initial confidence', () => {
  const db = openDatabase(':memory:')
  try {
    addReport(db, 'koerner', 'low', 100_000)
    assert.deepEqual(occupancy(db, 'koerner', 160_000), {
      busyness: 'low', recentReportCount: 1, latestReportMinutesAgo: 1, confidence: 'low',
    })
  } finally { db.close() }
})

test('stale reports disappear after 45 minutes', () => {
  const db = openDatabase(':memory:')
  try {
    addReport(db, 'koerner', 'high', 100_000)
    assert.equal(occupancy(db, 'koerner', 100_000 + WINDOW_MS + 1).busyness, 'unknown')
  } finally { db.close() }
})

test('conflicting equally frequent reports yield unknown rather than arbitrary status', () => {
  const db = openDatabase(':memory:')
  try {
    addReport(db, 'ikb', 'low', 100_000)
    addReport(db, 'ikb', 'high', 100_001)
    const result = occupancy(db, 'ikb', 100_002)
    assert.equal(result.busyness, 'unknown')
    assert.equal(result.recentReportCount, 2)
  } finally { db.close() }
})

test('a strong majority creates a higher-confidence estimate', () => {
  const db = openDatabase(':memory:')
  try {
    for (let i = 0; i < 5; i++) addReport(db, 'nest', i < 4 ? 'moderate' : 'high', 100_000 + i)
    assert.equal(occupancy(db, 'nest', 101_000).busyness, 'moderate')
    assert.equal(occupancy(db, 'nest', 101_000).confidence, 'high')
  } finally { db.close() }
})

test('plurality without an absolute majority is Unknown (3-2-2 split)', () => {
  const db = openDatabase(':memory:')
  try {
    const levels = ['low', 'low', 'low', 'moderate', 'moderate', 'high', 'high']
    for (let i = 0; i < levels.length; i++) addReport(db, 'koerner', levels[i], 100_000 + i)
    const result = occupancy(db, 'koerner', 100_010)
    assert.equal(result.busyness, 'unknown')
    assert.equal(result.confidence, 'low')
    assert.equal(result.recentReportCount, 7)
    addReport(db, 'koerner', 'low', 100_012)
    assert.equal(occupancy(db, 'koerner', 100_013).busyness, 'unknown') // 4 of 8 is not >50%
    addReport(db, 'koerner', 'low', 100_014)
    assert.equal(occupancy(db, 'koerner', 100_015).busyness, 'low') // 5 of 9
  } finally { db.close() }
})

test('later corrections do not refresh the original 45-minute report lifetime', () => {
  const db = openDatabase(':memory:')
  try {
    const now = 5_000_000
    const { reportId, editToken } = addReport(db, 'nest', 'low', now)
    assert.equal(correctReport(db, 'nest', reportId, editToken, 'high', now + 60_000), true)
    assert.equal(occupancy(db, 'nest', now + WINDOW_MS - 1).busyness, 'high')
    assert.equal(occupancy(db, 'nest', now + WINDOW_MS + 1).busyness, 'unknown')
  } finally { db.close() }
})
