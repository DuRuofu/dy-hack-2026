import { serve } from '@hono/node-server'
import app from './routes.js'

const port = 3101

console.log(`[demo1] server running at http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
