import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { parseVideo } from './services/videoParser.js'
import type { ParseTask, ProgressStep } from './types.js'

const app = new Hono()

// 内存存储任务状态
const tasks = new Map<string, ParseTask>()

const DEFAULT_STEPS: Omit<ProgressStep, 'status'>[] = [
  { name: 'meta', label: '获取视频信息' },
  { name: 'download', label: '下载视频' },
  { name: 'frames', label: '提取关键帧' },
  { name: 'audio', label: '提取音频' },
]

// POST /api/parse — 触发视频解析
app.post('/api/parse', async (c) => {
  const body = await c.req.json<{ url: string }>()
  const { url } = body

  if (!url) {
    return c.json({ error: 'url is required' }, 400)
  }

  const taskId = randomUUID().slice(0, 8)
  const task: ParseTask = {
    id: taskId,
    url,
    status: 'processing',
    steps: DEFAULT_STEPS.map(s => ({ ...s, status: 'pending' })),
    createdAt: Date.now(),
  }
  tasks.set(taskId, task)

  // 异步执行解析，带进度回调
  parseVideo(url, taskId, (stepName, detail, status) => {
    const t = tasks.get(taskId)
    if (!t) return

    if (stepName === 'done') {
      t.steps.forEach(s => { s.status = 'done' })
      return
    }

    const step = t.steps.find(s => s.name === stepName)
    if (step) {
      step.status = status ?? 'processing'
      step.detail = detail
    }
  })
    .then((result) => {
      const t = tasks.get(taskId)
      if (t) {
        t.status = 'done'
        t.steps.forEach(s => { s.status = 'done' })
        t.result = {
          taskId,
          status: 'done',
          meta: result.meta,
          frames: result.frames.map(f => path.basename(f)),
          audio: result.audio ? path.basename(result.audio) : undefined,
          outputDir: result.outputDir,
        }
      }
    })
    .catch((err) => {
      const t = tasks.get(taskId)
      if (t) {
        t.status = 'error'
        t.error = err instanceof Error ? err.message : String(err)
        // 标记当前正在处理的步骤为 error
        const processingStep = t.steps.find(s => s.status === 'processing')
        if (processingStep) {
          processingStep.status = 'error'
          processingStep.detail = t.error
        }
      }
    })

  return c.json({ taskId, status: 'processing' })
})

// GET /api/parse/:taskId — 查询解析结果
app.get('/api/parse/:taskId', (c) => {
  const taskId = c.req.param('taskId')
  const task = tasks.get(taskId)

  if (!task) {
    return c.json({ error: 'task not found' }, 404)
  }

  return c.json(task)
})

// GET /api/frames/:taskId/:filename — 服务帧图片
app.get('/api/frames/:taskId/:filename', (c) => {
  const taskId = c.req.param('taskId')
  const filename = c.req.param('filename')
  const filePath = path.join(process.cwd(), 'output', taskId, 'frames', filename)

  if (!fs.existsSync(filePath)) {
    return c.json({ error: 'frame not found' }, 404)
  }

  const stream = fs.createReadStream(filePath)
  return new Response(stream as any, {
    headers: { 'Content-Type': 'image/jpeg' },
  })
})

// GET /api/audio/:taskId — 服务音频文件
app.get('/api/audio/:taskId', (c) => {
  const taskId = c.req.param('taskId')
  const filePath = path.join(process.cwd(), 'output', taskId, 'audio.mp3')

  if (!fs.existsSync(filePath)) {
    return c.json({ error: 'audio not found' }, 404)
  }

  const stream = fs.createReadStream(filePath)
  return new Response(stream as any, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
})

// GET /api/status — 健康检查
app.get('/api/status', (c) => {
  return c.json({ ok: true, tasks: tasks.size })
})

export default app
