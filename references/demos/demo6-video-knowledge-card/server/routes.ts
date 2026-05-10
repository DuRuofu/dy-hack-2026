import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { transcribeAudio } from './services/transcriber.js'
import { extractCard } from './services/cardExtractor.js'
import { downloadAndExtractAudio } from './services/videoDownloader.js'
import type { CardTask } from './types.js'

const app = new Hono()

const tasks = new Map<string, CardTask>()

function createTask(): { taskId: string; task: CardTask } {
  const taskId = randomUUID().slice(0, 8)
  const task: CardTask = {
    id: taskId,
    status: 'processing',
    debugLog: [],
    createdAt: Date.now(),
  }
  tasks.set(taskId, task)
  return { taskId, task }
}

async function runPipeline(task: CardTask, audioPath: string, videoTitle: string) {
  try {
    // Step 1: 音频转写
    const { segments, fullText, debugLog: transcribeLog } = await transcribeAudio(audioPath)
    task.debugLog.push(...transcribeLog)
    task.videoTitle = videoTitle

    // Step 2: 知识卡片提取
    const { card, debugLog: extractLog } = await extractCard(segments, videoTitle)
    task.debugLog.push(...extractLog)
    task.card = card
    task.status = 'done'
  } catch (err) {
    task.status = 'error'
    task.error = err instanceof Error ? err.message : String(err)
  }
}

// POST /card — 输入视频链接，生成知识卡片
app.post('/card', async (c) => {
  const body = await c.req.json()
  const url = body.url as string

  if (!url) {
    return c.json({ error: '请提供视频链接' }, 400)
  }

  const { taskId, task } = createTask()

  ;(async () => {
    try {
      const outputDir = path.join(process.cwd(), 'output', taskId)
      const { audioPath, videoTitle, debugLog: downloadLog } = await downloadAndExtractAudio(url, outputDir)
      task.debugLog.push(...downloadLog)
      task.videoTitle = videoTitle

      await runPipeline(task, audioPath, videoTitle)
    } catch (err) {
      task.status = 'error'
      task.error = err instanceof Error ? err.message : String(err)
    }
  })()

  return c.json({ taskId, status: 'processing' })
})

// GET /card/:taskId — 查询卡片生成结果
app.get('/card/:taskId', (c) => {
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
