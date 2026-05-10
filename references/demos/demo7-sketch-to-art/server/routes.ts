import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import { textToImage, imageToImage } from './services/imageGenerator.js'
import type { GenerateTask } from './types.js'

const app = new Hono()
const tasks = new Map<string, GenerateTask>()

function createTask(mode: 't2i' | 'i2i', prompt?: string): { taskId: string; task: GenerateTask } {
  const taskId = randomUUID().slice(0, 8)
  const task: GenerateTask = {
    id: taskId,
    status: 'processing',
    mode,
    prompt,
    debugLog: [],
    createdAt: Date.now(),
  }
  tasks.set(taskId, task)
  return { taskId, task }
}

// POST /generate/t2i — 文生图
app.post('/generate/t2i', async (c) => {
  const body = await c.req.json()
  const prompt = body.prompt as string
  const aspectRatio = (body.aspect_ratio as string) || '1:1'

  if (!prompt) {
    return c.json({ error: '请提供 prompt' }, 400)
  }

  const { taskId, task } = createTask('t2i', prompt)

  ;(async () => {
    try {
      const { imageBase64, debugLog } = await textToImage(prompt, aspectRatio)
      task.debugLog.push(...debugLog)
      task.resultImage = imageBase64
      task.status = 'done'
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// POST /generate/i2i — 图生图（涂鸦 → 画作）
app.post('/generate/i2i', async (c) => {
  const body = await c.req.json()
  const sketchBase64 = body.image as string
  const prompt = (body.prompt as string) || '将这幅涂鸦转化为精美的艺术画作'
  const aspectRatio = (body.aspect_ratio as string) || '1:1'

  if (!sketchBase64) {
    return c.json({ error: '请提供涂鸦图片 (base64)' }, 400)
  }

  const { taskId, task } = createTask('i2i', prompt)

  ;(async () => {
    try {
      const { imageBase64, debugLog } = await imageToImage(sketchBase64, prompt, aspectRatio)
      task.debugLog.push(...debugLog)
      task.resultImage = imageBase64
      task.status = 'done'
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// GET /generate/:taskId — 查询结果
app.get('/generate/:taskId', (c) => {
  const taskId = c.req.param('taskId')
  const task = tasks.get(taskId)
  if (!task) return c.json({ error: 'task not found' }, 404)
  return c.json(task)
})

// GET /status
app.get('/status', (c) => {
  return c.json({ ok: true, tasks: tasks.size })
})

export default app
