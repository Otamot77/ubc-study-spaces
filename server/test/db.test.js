import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addReport, occupancy, openDatabase, WINDOW_MS } from '../src/db.js'

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
