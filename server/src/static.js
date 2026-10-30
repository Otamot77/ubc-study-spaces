import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.webp', 'image/webp'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.woff2', 'font/woff2'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
])

function extension(path) {
  const index = path.lastIndexOf('.')
  return index < 0 ? '' : path.slice(index).toLowerCase()
}

/** Serve only the built Vite directory; never serve server code or the SQLite volume. */
export async function serveStatic(req, res, staticDir) {
  const raw = new URL(req.url || '/', 'http://localhost').pathname
  let requested
  try { requested = decodeURIComponent(raw) }
  catch {
    res.writeHead(400).end()
    return true
  }
  if (requested.includes('\\') || requested.includes('\0') ||
      requested.split('/').some((part) => part === '..' || part === '.')) {
    res.writeHead(404).end()
    return true
  }

  const fileName = requested === '/' ? 'index.html' : requested.slice(1)
  const path = join(staticDir, fileName)
  const found = await stat(path).catch(() => null)
  let file = path
  if (!found?.isFile()) {
    // Vite SPA fallback applies only to extensionless paths, not missing assets.
    if (extension(fileName)) return false
    file = join(staticDir, 'index.html')
    if (!(await stat(file).catch(() => null))?.isFile()) return false
  }
  const type = TYPES.get(extension(file)) || 'application/octet-stream'
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': extension(file) === '.html' ? 'no-store' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  })
  const stream = createReadStream(file)
  stream.on('error', () => res.destroy())
  stream.pipe(res)
  return true
}
