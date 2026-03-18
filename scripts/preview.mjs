import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteConfig } from '../src/site-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')
const port = 4173
const basePath = siteConfig.basePath.replace(/\/$/, '')

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
}

createServer(async (req, res) => {
  try {
    const requestPath = (req.url || '/').split('?')[0]
    const strippedPath = stripBasePath(requestPath)
    const normalizedPath = normalizePath(strippedPath)
    const fullPath = path.join(distDir, normalizedPath)
    const statPath = normalizedPath.endsWith(path.sep)
      ? path.join(fullPath, 'index.html')
      : fullPath
    const data = await readFile(statPath)
    res.writeHead(200, { 'content-type': mimeTypes[path.extname(statPath)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    try {
      const fallback = await readFile(path.join(distDir, 'index.html'))
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(fallback)
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
  }
}).listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`)
})

function stripBasePath(requestPath) {
  if (requestPath === basePath || requestPath === `${basePath}/`) {
    return '/'
  }
  if (requestPath.startsWith(`${basePath}/`)) {
    return requestPath.slice(basePath.length)
  }
  return requestPath
}

function normalizePath(requestPath) {
  if (requestPath === '/' || requestPath === '') {
    return 'index.html'
  }

  const trimmed = requestPath.replace(/^\/+/, '')
  if (trimmed.endsWith('/')) {
    return path.join(trimmed, 'index.html')
  }

  if (!path.extname(trimmed)) {
    return path.join(trimmed, 'index.html')
  }

  return trimmed
}
