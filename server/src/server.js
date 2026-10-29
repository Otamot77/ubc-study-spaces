import { openDatabase } from './db.js'
import { makeServer } from './http.js'

const db = openDatabase()
const port = Number(process.env.PORT || 8787)
// Bind to loopback only. Phones access the frontend through Vite's /api proxy.
const host = '127.0.0.1'
const server = makeServer({ db })
server.listen(port, host, () => {
  console.log(`Study Spaces API ready at http://${host}:${port}/api/health`)
})
process.on('SIGINT', () => { server.close(); db.close() })
process.on('SIGTERM', () => { server.close(); db.close() })
