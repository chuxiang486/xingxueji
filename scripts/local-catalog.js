import { mkdirSync, readFileSync } from 'node:fs'
import { loadEnv } from 'vite'
import { handleCatalog } from '../server/catalog.js'
import { handleContent } from '../server/content.js'

export function localCatalog() {
  let mode
  async function setup(server) {
    const token = process.env.ADMIN_TOKEN || loadEnv(mode, process.cwd(), 'ADMIN_TOKEN').ADMIN_TOKEN
    let db
    function binding(DatabaseSync) {
      if (!db) {
        mkdirSync('.wrangler', { recursive: true })
        db = new DatabaseSync('.wrangler/catalog.sqlite')
        db.exec('BEGIN IMMEDIATE')
        try {
          if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='songs'").get()) {
            db.exec(readFileSync('migrations/0001_songs.sql', 'utf8'))
          }
          db.exec(readFileSync('migrations/0002_content.sql', 'utf8'))
          db.exec('COMMIT')
        } catch (error) {
          db.exec('ROLLBACK')
          db.close()
          db = null
          throw error
        }
      }
      return { prepare(sql) {
        const stmt = db.prepare(sql)
        return {
          all: () => ({ results: stmt.all() }),
          bind: (...args) => ({ run() {
            const result = stmt.run(...args)
            return { meta: { changes: result.changes, last_row_id: result.lastInsertRowid } }
          }, all: () => ({ results: stmt.all(...args) }) }),
        }
      } }
    }
    server.httpServer?.once('close', () => db?.close())
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/admin' || url.pathname === '/admin/') {
        req.url = '/admin/index.html'
        return next()
      }
      if (!['/api/songs','/api/content'].includes(url.pathname)) return next()
      try {
        const init = { method: req.method, headers: req.headers }
        if (!['GET','HEAD'].includes(req.method)) Object.assign(init, { body: req, duplex: 'half' })
        const DB = token ? binding((await import('node:sqlite')).DatabaseSync) : undefined
        const handler = url.pathname === '/api/content' ? handleContent : handleCatalog
        const response = await handler({ request: new Request(url, init), env: { DB, ADMIN_TOKEN: token } })
        res.writeHead(response.status, Object.fromEntries(response.headers))
        res.end(await response.text())
      } catch (error) { next(error) }
    })
  }
  return {
    name: 'local-catalog',
    configResolved(config) { mode = config.mode },
    configureServer: setup,
    configurePreviewServer: setup,
  }
}
