import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase, WINDOW_MS } from '../src/db.js'
import { createRateLimiter, makeServer } from '../src/http.js'

const A = 'a'.repeat(32)
const B = 'b'.repeat(32)
const C = 'c'.repeat(32)

async function withServer(callback) {
  let now = 1_000_000
  const db = openDatabase(':memory:')
  const server = makeServer({ db, clock: () => now })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = 'http://127.0.0.1:' + server.address().port
  try { await callback({ base, setTime: (value) => { now = value } }) }
  finally {
    await new Promise((resolve) => server.close(resolve))
    db.close()
  }
}

function send(base, id, path, method, body) {
  return fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Study-Spaces-Reporter': id },
    body: JSON.stringify(body),
  })
}

async function getSpace(base, id) {
  const response = await fetch(base + '/api/spaces')
  assert.equal(response.status, 200)
  const { spaces } = await response.json()
  return spaces.find((space) => space.id === id)
}

test('two simulated phones behind the same Vite proxy can report the same building', async () => {
  await withServer(async ({ base, setTime }) => {
    const path = '/api/spaces/koerner/reports'
    const [a, b] = await Promise.all([
      send(base, A, path, 'POST', { level: 'low' }),
      send(base, B, path, 'POST', { level: 'high' }),
    ])
    assert.equal(a.status, 201)
    assert.equal(b.status, 201)
    const first = await a.json()
    const second = await b.json()
    assert.notEqual(first.reportId, second.reportId)
    assert.notEqual(first.editToken, second.editToken)
    let state = await getSpace(base, 'koerner')
    assert.equal(state.recentReportCount, 2)
    assert.equal(state.busyness, 'unknown')
    assert.equal(state.confidence, 'low')

    // Simulate first phone correcting its report: same row, no duplicate.
    setTime(1_020_000)
    const correction = await send(base, A, path + '/' + first.reportId, 'PATCH', {
      level: 'high', editToken: first.editToken,
    })
    assert.equal(correction.status, 200)
    state = await getSpace(base, 'koerner')
    assert.equal(state.busyness, 'high')
    assert.equal(state.recentReportCount, 2)
    assert.equal(state.latestReportMinutesAgo, 0)

    // A third independent reporter strengthens the estimate.
    const c = await send(base, C, path, 'POST', { level: 'high' })
    assert.equal(c.status, 201)
    state = await getSpace(base, 'koerner')
    assert.equal(state.recentReportCount, 3)
    assert.equal(state.busyness, 'high')
    assert.equal(state.confidence, 'medium')

    const third = await c.json()
    const undo = await send(base, C, path + '/' + third.reportId, 'PATCH', {
      level: null, editToken: third.editToken,
    })
    assert.equal(undo.status, 200)
    state = await getSpace(base, 'koerner')
    assert.equal(state.recentReportCount, 2)
    assert.equal(state.busyness, 'high')
  })
})

test('same-device cooldown, other devices, hourly limit and invalid IDs', () => {
  const limit = createRateLimiter()
  const now = 200_000
  assert.equal(limit('127.0.0.1', 'ikb', now, A), true)
  assert.equal(limit('127.0.0.1', 'ikb', now + 100, A), false)
  assert.equal(limit('127.0.0.1', 'ikb', now + 100, B), true)
  assert.equal(limit('127.0.0.1', 'ikb', now + 30_000, A), true)
  assert.equal(limit('127.0.0.1', 'nest', now + 30_001, A), true)
  // Missing / invalid IDs fall back to IP cooldown for legacy clients.
  assert.equal(limit('127.0.0.2', 'ikb', now, 'invalid'), true)
  assert.equal(limit('127.0.0.2', 'ikb', now + 100, undefined), false)
  for (let i = 0; i < 17; i++) {
    assert.equal(limit('127.0.0.3', 'ikb', now + 30_000 * i, A), true)
  }
  assert.equal(limit('127.0.0.3', 'ikb', now + 30_000 * 17, A), true)
  assert.equal(limit('127.0.0.3', 'ikb', now + 30_000 * 18, A), true)
  assert.equal(limit('127.0.0.3', 'ikb', now + 30_000 * 19, A), true)
  assert.equal(limit('127.0.0.3', 'ikb', now + 30_000 * 20, A), false)
})

test('stale and revoked reports disappear without changing other buildings', async () => {
  await withServer(async ({ base, setTime }) => {
    const a = await send(base, A, '/api/spaces/law/reports', 'POST', { level: 'low' })
    const b = await send(base, B, '/api/spaces/woodward/reports', 'POST', { level: 'high' })
    assert.equal(a.status, 201)
    assert.equal(b.status, 201)
    const first = await a.json()
    const undo = await send(base, A, '/api/spaces/law/reports/' + first.reportId, 'PATCH', {
      level: null, editToken: first.editToken,
    })
    assert.equal(undo.status, 200)
    assert.equal((await getSpace(base, 'law')).recentReportCount, 0)
    assert.equal((await getSpace(base, 'woodward')).busyness, 'high')
    setTime(1_000_000 + WINDOW_MS + 1)
    assert.equal((await getSpace(base, 'woodward')).busyness, 'unknown')
    assert.equal((await getSpace(base, 'woodward')).recentReportCount, 0)
  })
})

test('network-wide abuse cap still applies to rapidly rotating reporter IDs', () => {
  const limit = createRateLimiter()
  for (let i = 0; i < 60; i++) {
    const id = i.toString(16).padStart(32, '0')
    assert.equal(limit('127.0.0.4', 'law', 100_000 + i, id), true)
  }
  assert.equal(limit('127.0.0.4', 'law', 100_061, 'f'.repeat(32)), false)
  assert.equal(limit('127.0.0.4', 'law', 100_000 + 3_600_001, 'f'.repeat(32)), true)
})
