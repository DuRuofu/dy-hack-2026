import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { processVideo } from './services/videoProcessor.js'
import { answerQuestion } from './services/qaEngine.js'
import type { VideoSession } from './types.js'

const app = new Hono()

const sessions = new Map<string, VideoSession>()

// POST /api/session — 创建视频会话（传入视频链接）
app.post('/api/session', async (c) => {
  const body = await c.req.json()
  const url = body.url as string

  if (!url) {
    return c.json({ error: '请提供视频链接' }, 400)
  }

  const sessionId = randomUUID().slice(0, 8)
  const session: VideoSession = {
    id: sessionId,
    status: 'loading',
    messages: [],
    createdAt: Date.now(),
    debugLog: [],
  }
  sessions.set(sessionId, session)

  ;(async () => {
    try {
      const outputDir = path.join(process.cwd(), 'output', sessionId)
      const { frames, transcript, videoTitle, debugLog } = await processVideo(url, outputDir)
      session.debugLog.push(...debugLog)
      session.frames = frames
      session.transcript = transcript
      session.videoTitle = videoTitle
      session.status = 'ready'
    } catch (err) {
      session.status = 'error'
      session.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ sessionId, status: 'loading' })
})

// GET /api/session/:sessionId — 查询会话状态
app.get('/api/session/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId')
  const session = sessions.get(sessionId)
  if (!session) return c.json({ error: 'session not found' }, 404)

  return c.json({
    id: session.id,
    status: session.status,
    videoTitle: session.videoTitle,
    framesCount: session.frames?.length || 0,
    transcriptLength: session.transcript?.length || 0,
    messages: session.messages,
    error: session.error,
    debugLog: session.debugLog,
  })
})

// POST /api/session/:sessionId/ask — 提问
app.post('/api/session/:sessionId/ask', async (c) => {
  const sessionId = c.req.param('sessionId')
  const session = sessions.get(sessionId)

  if (!session) return c.json({ error: 'session not found' }, 404)
  if (session.status !== 'ready') return c.json({ error: '视频尚未加载完成' }, 400)

  const body = await c.req.json()
  const question = body.question as string
  if (!question) return c.json({ error: '请输入问题' }, 400)

  session.messages.push({ role: 'user', content: question })

  try {
    const { answer, debugLog } = await answerQuestion(
      session.frames!,
      session.transcript || '',
      question,
      session.messages.slice(0, -1),
    )
    session.debugLog.push(...debugLog)
    session.messages.push({ role: 'assistant', content: answer })
    return c.json({ answer })
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})

// GET /api/frames/:sessionId/:filename — 获取帧图片
app.get('/api/frames/:sessionId/:filename', async (c) => {
  const sessionId = c.req.param('sessionId')
  const filename = c.req.param('filename')
  const filePath = path.join(process.cwd(), 'output', sessionId, 'frames', filename)

  try {
    const data = await fs.readFile(filePath)
    return new Response(data, {
      headers: { 'Content-Type': 'image/jpeg' },
    })
  } catch {
    return c.json({ error: 'not found' }, 404)
  }
})

// GET /api/status
app.get('/api/status', (c) => {
  return c.json({ ok: true, sessions: sessions.size })
})

export default app
