import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.js'
import { makeServer } from '../src/http.js'

async function withServer(callback) {
  const db = openDatabase(':memory:')
  const server = makeServer({ db })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  try { await callback('http://127.0.0.1:' + port) }
  finally { await new Promise((resolve) => server.close(resolve)); db.close() }
}

test('GET starts unknown and POST persists a genuine crowd report', async () => {
  await withServer(async (base) => {
    const before = await (await fetch(base + '/api/spaces')).json()
    assert.equal(before.spaces.length, 8)
    assert.equal(before.spaces.find((s) => s.id === 'koerner').busyness, 'unknown')
    assert.equal(before.spaces[0].walkingMinutes, null)
    const response = await fetch(base + '/api/spaces/koerner/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'low' }),
    })
    assert.equal(response.status, 201)
    const after = await (await fetch(base + '/api/spaces')).json()
    assert.equal(after.spaces.find((s) => s.id === 'koerner').busyness, 'low')
  })
})

test('rejects invalid bodies, unknown IDs, and immediate repeated reports', async () => {
  await withServer(async (base) => {
    async function post(path, body) {
      return fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    assert.equal((await post('/api/spaces/koerner/reports', { level: 'unknown' })).status, 400)
    assert.equal((await post('/api/spaces/not-a-place/reports', { level: 'high' })).status, 404)
    assert.equal((await post('/api/spaces/koerner/reports', { level: 'high' })).status, 201)
    assert.equal((await post('/api/spaces/koerner/reports', { level: 'high' })).status, 429)
  })
})
