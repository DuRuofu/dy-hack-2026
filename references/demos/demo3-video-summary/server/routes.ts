import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { transcribeAudio } from './services/transcriber.js'
import { summarizeVideo } from './services/summarizer.js'
import { downloadAndExtractAudio } from './services/videoDownloader.js'
import type { SummaryTask } from './types.js'

const app = new Hono()

const tasks = new Map<string, SummaryTask>()

function createTask(): { taskId: string; task: SummaryTask } {
  const taskId = randomUUID().slice(0, 8)
  const task: SummaryTask = {
    id: taskId,
    status: 'processing',
    createdAt: Date.now(),
    debugLog: [],
  }
  tasks.set(taskId, task)
  return { taskId, task }
}

async function runPipeline(task: SummaryTask, audioPath: string) {
  try {
    // 第一步：音频转写
    const { segments, fullText, debugLog: transcribeLog } = await transcribeAudio(audioPath)
    task.debugLog.push(...transcribeLog)
    task.transcript = segments
    task.fullText = fullText

    // 第二步：生成摘要
    const { summary, debugLog: summaryLog } = await summarizeVideo(segments)
    task.debugLog.push(...summaryLog)
    task.summary = summary
    task.status = 'done'
  } catch (err) {
    task.status = 'error'
    task.error = err instanceof Error ? err.message : String(err)
  }
}

// POST /api/summary/url — 输入视频链接，自动下载提取音频后摘要
app.post('/api/summary/url', async (c) => {
  const body = await c.req.json()
  const url = body.url as string

  if (!url) {
    return c.json({ error: '请提供视频链接' }, 400)
  }

  const { taskId, task } = createTask()

  ;(async () => {
    try {
      const outputDir = path.join(process.cwd(), 'output', taskId)

      // 下载视频并提取音频
      const { audioPath, videoTitle, debugLog: downloadLog } = await downloadAndExtractAudio(url, outputDir)
      task.debugLog.push(...downloadLog)

      if (videoTitle) {
        task.videoTitle = videoTitle
      }

      // 转写 + 摘要
      await runPipeline(task, audioPath)
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// POST /api/summary/upload — 上传音频文件后摘要
app.post('/api/summary/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('audio') as File | null

  if (!file) {
    return c.json({ error: '请上传音频文件' }, 400)
  }

  const { taskId, task } = createTask()

  const outputDir = path.join(process.cwd(), 'output', taskId)
  await fs.mkdir(outputDir, { recursive: true })

  const ext = path.extname(file.name) || '.mp3'
  const audioPath = path.join(outputDir, `input${ext}`)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(audioPath, buffer)

  runPipeline(task, audioPath)

  return c.json({ taskId, status: 'processing' })
})

// POST /api/summary — 兼容旧接口（上传音频）
app.post('/api/summary', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('audio') as File | null

  if (!file) {
    return c.json({ error: '请上传音频文件' }, 400)
  }

  const { taskId, task } = createTask()

  const outputDir = path.join(process.cwd(), 'output', taskId)
  await fs.mkdir(outputDir, { recursive: true })

  const ext = path.extname(file.name) || '.mp3'
  const audioPath = path.join(outputDir, `input${ext}`)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(audioPath, buffer)

  runPipeline(task, audioPath)

  return c.json({ taskId, status: 'processing' })
})

// GET /api/summary/:taskId — 查询结果
app.get('/api/summary/:taskId', (c) => {
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
