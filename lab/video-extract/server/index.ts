import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './routes.js'

const port = parseInt(process.env.PORT || '3101', 10)

if (!process.env.DASHSCOPE_API_KEY) {
  console.error('[ERROR] 请先配置 .env 文件中的 DASHSCOPE_API_KEY')
  console.error('  cp .env.example .env  然后填入你的 API Key')
  process.exit(1)
}

console.log(`[video-extract] server running at http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
