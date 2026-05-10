import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

const { Hono } = await import('hono')
const { cors } = await import('hono/cors')
const { serve } = await import('@hono/node-server')
const { default: cardRoutes } = await import('./routes.js')

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:5176', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

app.route('/api', cardRoutes)

const port = 3006

console.log(`[demo6] server running at http://localhost:${port}`)
console.log('[demo6] routes registered')

serve({
  fetch: app.fetch,
  port,
})
