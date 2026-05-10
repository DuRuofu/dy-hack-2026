import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { createReadStream } from 'fs'
import { analyzeImage } from './services/imageAnalyzer.js'
import type { AnalysisTask } from './types.js'

const app = new Hono()

const tasks = new Map<string, AnalysisTask>()

// POST /api/analyze — 上传图片并分析
app.post('/api/analyze', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return c.json({ error: '请上传图片文件' }, 400)
  }

  const taskId = randomUUID().slice(0, 8)
  const outputDir = path.join(process.cwd(), 'output', taskId)
  await fs.mkdir(outputDir, { recursive: true })

  // 保存上传的文件
  const ext = path.extname(file.name) || '.jpg'
  const imagePath = path.join(outputDir, `input${ext}`)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(imagePath, buffer)

  const task: AnalysisTask = {
    id: taskId,
    status: 'processing',
    createdAt: Date.now(),
    debugLog: [],
  }
  tasks.set(taskId, task)

  // 异步分析
  analyzeImage(imagePath)
    .then(({ parsed, raw, debugLog }) => {
      const t = tasks.get(taskId)
      if (t) {
        t.debugLog = debugLog
        if (parsed) {
          t.status = 'done'
          t.result = parsed
        } else {
          t.status = 'done'
          t.rawResponse = raw
        }
      }
    })
    .catch((err) => {
      const t = tasks.get(taskId)
      if (t) {
        t.status = 'error'
        t.error = err instanceof Error ? err.message : String(err)
      }
    })

  return c.json({ taskId, status: 'processing' })
})

// GET /api/analyze/:taskId — 查询结果
app.get('/api/analyze/:taskId', (c) => {
  const taskId = c.req.param('taskId')
  const task = tasks.get(taskId)
  if (!task) return c.json({ error: 'task not found' }, 404)
  return c.json(task)
})

// GET /api/image/:taskId — 获取上传的图片
app.get('/api/image/:taskId', async (c) => {
  const taskId = c.req.param('taskId')
  const outputDir = path.join(process.cwd(), 'output', taskId)

  try {
    const files = await fs.readdir(outputDir)
    const imageFile = files.find(f => f.startsWith('input.'))
    if (!imageFile) return c.json({ error: 'image not found' }, 404)

    const filePath = path.join(outputDir, imageFile)
    const stream = createReadStream(filePath)
    const ext = path.extname(imageFile).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
    }

    return new Response(stream as any, {
      headers: { 'Content-Type': mimeMap[ext] || 'image/jpeg' },
    })
  } catch {
    return c.json({ error: 'not found' }, 404)
  }
})

// GET /api/status
app.get('/api/status', (c) => {
  return c.json({ ok: true, tasks: tasks.size })
})

export default app
