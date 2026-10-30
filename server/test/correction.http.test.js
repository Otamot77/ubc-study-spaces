import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase, CORRECTION_MS } from '../src/db.js'
import { makeServer } from '../src/http.js'

async function withServer(clock, callback) {
  const db = openDatabase(':memory:')
  const server = makeServer({ db, clock })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try { await callback('http://127.0.0.1:' + server.address().port) }
  finally { await new Promise((resolve) => server.close(resolve)); db.close() }
}

async function send(base, path, method, body) {
  return fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('one-tap save followed by correction changes the same report', async () => {
  let now = 1_000_000
  await withServer(() => now, async (base) => {
    const path = '/api/spaces/koerner/reports'
    const created = await send(base, path, 'POST', { level: 'low' })
    assert.equal(created.status, 201)
    const info = await created.json()
    assert.equal(info.recentReportCount, 1)
    assert.ok(Number.isSafeInteger(info.reportId))
    assert.equal(typeof info.editToken, 'string')
    now += 60_000
    const correction = await send(base, path + '/' + info.reportId, 'PATCH', { level: 'high', editToken: info.editToken })
    assert.equal(correction.status, 200)
    const changed = await correction.json()
    assert.equal(changed.corrected, true)
    assert.equal(changed.busyness, 'high')
    assert.equal(changed.recentReportCount, 1)
    assert.equal(changed.latestReportMinutesAgo, 1)
    const fetched = await (await fetch(base + '/api/spaces')).json()
    assert.equal(fetched.spaces.find((s) => s.id === 'koerner').busyness, 'high')
  })
})

test('corrections require the secret and expire; ordinary POST cooldown still applies', async () => {
  let now = 1_000_000
  await withServer(() => now, async (base) => {
    const path = '/api/spaces/nest/reports'
    const created = await (await send(base, path, 'POST', { level: 'low' })).json()
    const editPath = path + '/' + created.reportId
    assert.equal((await send(base, path, 'POST', { level: 'high' })).status, 429)
    assert.equal((await send(base, editPath, 'PATCH', { level: 'high', editToken: 'wrong' })).status, 409)
    assert.equal((await send(base, editPath, 'PATCH', { level: 'bogus', editToken: created.editToken })).status, 400)
    assert.equal((await send(base, '/api/spaces/ikb/reports/' + created.reportId, 'PATCH', { level: 'high', editToken: created.editToken })).status, 409)
    now += CORRECTION_MS + 1
    assert.equal((await send(base, editPath, 'PATCH', { level: 'high', editToken: created.editToken })).status, 409)
    const fetched = await (await fetch(base + '/api/spaces')).json()
    const nest = fetched.spaces.find((s) => s.id === 'nest')
    assert.equal(nest.recentReportCount, 1)
    assert.equal(nest.busyness, 'low')
  })
})
