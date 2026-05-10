import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

const { Hono } = await import('hono')
const { cors } = await import('hono/cors')
const { serve } = await import('@hono/node-server')
const { default: routes } = await import('./routes.js')

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:5178', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

app.route('/api', routes)

const port = 3107

console.log(`[demo7] server running at http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
