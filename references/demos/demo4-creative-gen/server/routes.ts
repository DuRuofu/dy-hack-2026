import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { generateContent } from './services/contentGenerator.js'
import { analyzeImage } from './services/imageAnalyzer.js'
import type { GenerateTask, Style } from './types.js'

const app = new Hono()

const tasks = new Map<string, GenerateTask>()

const VALID_STYLES: Style[] = ['xiaohongshu', 'science', 'recommend', 'travel']

// POST /api/generate — 文字输入生成
app.post('/api/generate/text', async (c) => {
  const body = await c.req.json()
  const text = body.text as string
  const style = (body.style as Style) || 'xiaohongshu'

  if (!text) {
    return c.json({ error: '请输入内容描述' }, 400)
  }
  if (!VALID_STYLES.includes(style)) {
    return c.json({ error: '无效的风格类型' }, 400)
  }

  const taskId = randomUUID().slice(0, 8)
  const task: GenerateTask = {
    id: taskId,
    status: 'processing',
    style,
    inputType: 'text',
    inputText: text,
    createdAt: Date.now(),
    debugLog: [],
  }
  tasks.set(taskId, task)

  ;(async () => {
    try {
      const { content, debugLog } = await generateContent(text, style)
      task.debugLog.push(...debugLog)
      task.content = content
      task.status = 'done'
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// POST /api/generate/image — 图片输入生成
app.post('/api/generate/image', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('image') as File | null
  const style = (formData.get('style') as Style) || 'xiaohongshu'

  if (!file) {
    return c.json({ error: '请上传图片' }, 400)
  }
  if (!VALID_STYLES.includes(style)) {
    return c.json({ error: '无效的风格类型' }, 400)
  }

  const taskId = randomUUID().slice(0, 8)
  const outputDir = path.join(process.cwd(), 'output', taskId)
  await fs.mkdir(outputDir, { recursive: true })

  const ext = path.extname(file.name) || '.jpg'
  const imagePath = path.join(outputDir, `input${ext}`)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(imagePath, buffer)

  const task: GenerateTask = {
    id: taskId,
    status: 'processing',
    style,
    inputType: 'image',
    createdAt: Date.now(),
    debugLog: [],
  }
  tasks.set(taskId, task)

  ;(async () => {
    try {
      // 先分析图片
      const { context, debugLog: analyzeLog } = await analyzeImage(imagePath)
      task.debugLog.push(...analyzeLog)
      task.imageContext = context

      // 再生成内容
      const { content, debugLog: genLog } = await generateContent(context, style)
      task.debugLog.push(...genLog)
      task.content = content
      task.status = 'done'
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// GET /api/generate/:taskId — 查询结果
app.get('/api/generate/:taskId', (c) => {
  const taskId = c.req.param('taskId')
  const task = tasks.get(taskId)
  if (!task) return c.json({ error: 'task not found' }, 404)
  return c.json(task)
})

// GET /api/status
app.get('/api/status', (c) => {
  return c.json({ ok: true, tasks: tasks.size })
})

export default app
