import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.js'
import { makeServer } from '../src/http.js'

async function withBetaServer(callback) {
  const db = openDatabase(':memory:')
  const server = makeServer({ db, betaCode: 'long-test-invite-code' })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = 'http://127.0.0.1:' + server.address().port
  try { await callback(url) }
  finally { await new Promise(resolve => server.close(resolve)); db.close() }
}

test('exposes safe beta configuration and keeps public reads available', async () => {
  await withBetaServer(async url => {
    const config = await (await fetch(url + '/api/config')).json()
    assert.deepEqual(config, { betaAccessRequired: true })
    const data = await (await fetch(url + '/api/spaces')).json()
    assert.equal(data.spaces.length, 8)
  })
})

test('beta code protects report submission and edits without leaking secret', async () => {
  await withBetaServer(async url => {
    const path = url + '/api/spaces/koerner/reports'
    const send = (method, target, body, code) =>
      fetch(target, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(code ? { 'X-Study-Spaces-Access': code } : {}),
        },
        body: JSON.stringify(body),
      })
    assert.equal((await send('POST', path, { level: 'low' })).status, 403)
    assert.equal((await send('POST', path, { level: 'low' }, 'wrong-code')).status, 403)
    const saved = await send('POST', path, { level: 'low' }, 'long-test-invite-code')
    assert.equal(saved.status, 201)
    const data = await saved.json()
    const editPath = path + '/' + data.reportId
    assert.equal((await send('PATCH', editPath, { level: 'high', editToken: data.editToken })).status, 403)
    assert.equal((await send('PATCH', editPath, { level: 'high', editToken: data.editToken }, 'long-test-invite-code')).status, 200)
    const count = (await (await fetch(url + '/api/spaces')).json()).spaces.find(s => s.id === 'koerner')
    assert.equal(count.recentReportCount, 1)
    assert.equal(count.busyness, 'high')
  })
})
