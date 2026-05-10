import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

const { serve } = await import('@hono/node-server')
const { default: app } = await import('./routes.js')

const port = 3102

console.log(`[demo2] server running at http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
