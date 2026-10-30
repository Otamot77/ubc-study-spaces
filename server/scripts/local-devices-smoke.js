/**
 * Two simulated phones using the real local HTTP API + in-memory SQLite.
 * Does not touch the developer's database, require a host, or send fake reports
 * to actual study spaces. Real physical-device QA remains a separate checklist.
 *
 * Run: cd server && npm run test:devices
 */
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.js'
import { makeServer } from '../src/http.js'

const db = openDatabase(':memory:')
const server = makeServer({ db })
const id1 = '1'.repeat(32)
const id2 = '2'.repeat(32)
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:' + server.address().port
const post = (id, path, body, method = 'POST') =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Study-Spaces-Reporter': id },
    body: JSON.stringify(body),
  })
const get = async (id) => {
  const r = await fetch(base + '/api/spaces')
  if (!r.ok) throw new Error('Unable to load spaces')
  return (await r.json()).spaces.find((s) => s.id === id)
}

try {
  console.log('Checking two simulated devices through one local IP...')
  const path = '/api/spaces/koerner/reports'
  const [first, second] = await Promise.all([
    post(id1, path, { level: 'low' }),
    post(id2, path, { level: 'high' }),
  ])
  assert.equal(first.status, 201)
  assert.equal(second.status, 201)
  const a = await first.json()
  const b = await second.json()
  assert.equal((await get('koerner')).recentReportCount, 2)
  assert.equal((await get('koerner')).busyness, 'unknown')
  console.log('PASS: separate phones can submit conflicting votes; tie is Unknown.')

  const corrected = await post(id1, path + '/' + a.reportId, {
    level: 'high', editToken: a.editToken,
  }, 'PATCH')
  assert.equal(corrected.status, 200)
  assert.equal((await get('koerner')).busyness, 'high')
  assert.equal((await get('koerner')).recentReportCount, 2)
  console.log('PASS: correction changes original vote, not total count.')

  const undo = await post(id2, path + '/' + b.reportId, {
    level: null, editToken: b.editToken,
  }, 'PATCH')
  assert.equal(undo.status, 200)
  assert.equal((await get('koerner')).recentReportCount, 1)
  console.log('PASS: unselect removes one vote and updates other viewers.')

  assert.equal((await post(id1, path, { level: 'high' })).status, 429)
  console.log('PASS: repeated submissions from the same device are rate limited.')

  const { spaces } = await (await fetch(base + '/api/spaces')).json()
  assert.equal(spaces.length, 13)
  console.log('PASS: all 13 study spaces load over the API.')
  console.log('All simulated-device checks passed. Database was in memory only.')
} finally {
  await new Promise((resolve) => server.close(resolve))
  db.close()
}
