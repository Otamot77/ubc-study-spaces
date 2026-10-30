import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { openDatabase } from './db.js'
import { makeServer } from './http.js'

// A public deployment must fail closed rather than silently accept anonymous
// submissions or use an ephemeral SQLite file.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.BETA_REPORT_CODE || process.env.BETA_REPORT_CODE.length < 12) {
    throw new Error('Production requires BETA_REPORT_CODE (at least 12 characters)')
  }
  if (!process.env.STUDY_SPACES_DB_PATH) {
    throw new Error('Production requires STUDY_SPACES_DB_PATH on a persistent volume')
  }
  if (!process.env.STATIC_DIR || !existsSync(join(process.env.STATIC_DIR, 'index.html'))) {
    throw new Error('Production requires STATIC_DIR containing the built frontend')
  }
}

const db = openDatabase()
const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || '127.0.0.1'
const server = makeServer({ db })
server.listen(port, host, () => {
  console.log(`Study Spaces ready at http://${host}:${port}/api/health`)
})

function shutdown() {
  server.close(() => db.close())
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
