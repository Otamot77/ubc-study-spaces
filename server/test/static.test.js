import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { openDatabase } from '../src/db.js'
import { makeServer } from '../src/http.js'

test('serves the built frontend and SPA routes without exposing server files', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-spaces-static-'))
  mkdirSync(join(dir, 'assets'))
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>Study Spaces</title>')
  writeFileSync(join(dir, 'assets', 'index.js'), 'console.log("app")')
  const db = openDatabase(':memory:')
  const server = makeServer({ db, staticDir: dir })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = 'http://127.0.0.1:' + server.address().port
  try {
    const home = await fetch(url + '/')
    assert.equal(home.status, 200)
    assert.match(home.headers.get('content-type'), /text\/html/)
    assert.match(await home.text(), /Study Spaces/)
    const route = await fetch(url + '/study-spaces')
    assert.equal(route.status, 200)
    const js = await fetch(url + '/assets/index.js')
    assert.match(js.headers.get('content-type'), /javascript/)
    assert.equal(await js.text(), 'console.log("app")')
    const missing = await fetch(url + '/assets/not-found.js')
    assert.equal(missing.status, 404)
    const api = await fetch(url + '/api/spaces')
    assert.equal(api.status, 200)
    assert.match(api.headers.get('content-type'), /application\/json/)
  } finally {
    await new Promise(resolve => server.close(resolve))
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
