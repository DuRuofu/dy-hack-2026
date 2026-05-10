import { Hono } from 'hono'
import { randomUUID, createHash } from 'crypto'
import path from 'path'
import fs from 'fs'
import OpenAI from 'openai'
import { parseMeta, downloadVideo, extractFramesByCount, extractAudio } from './services/videoParser.js'
import { analyzeFrames } from './services/clothingRecognizer.js'
import { transcribeAudio } from './services/audioTranscriber.js'
import type { ParseTask, ProgressStep, ClothingItem, FrameAnalysis, OutfitSet, ParseResult } from './types.js'

const app = new Hono()

const tasks = new Map<string, ParseTask>()

const dashscopeClient = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const CACHE_DIR = path.join(process.cwd(), 'output', 'cache')

const DEFAULT_STEPS: Omit<ProgressStep, 'status'>[] = [
  { name: 'meta', label: '获取视频信息' },
  { name: 'download', label: '下载视频' },
  { name: 'frames', label: '提取关键帧' },
  { name: 'transcript', label: '音频转写' },
  { name: 'recognize', label: 'AI 识别衣物' },
]

function urlHash(url: string): string {
  return createHash('md5').update(url).digest('hex').slice(0, 12)
}

function updateStep(task: ParseTask, stepName: string, detail?: string, status?: ProgressStep['status']) {
  const step = task.steps.find(s => s.name === stepName)
  if (step) {
    step.status = status ?? 'processing'
    if (detail) step.detail = detail
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function deduplicateItems(analysis: FrameAnalysis[]): ClothingItem[] {
  const seen = new Map<string, ClothingItem>()
  for (const fa of analysis) {
    for (const item of fa.items) {
      const key = `${item.category}|${item.color}`
      if (!seen.has(key)) {
        seen.set(key, item)
      }
    }
  }
  return Array.from(seen.values())
}

function buildOutfits(analysis: FrameAnalysis[]): OutfitSet[] {
  return analysis
    .map(fa => ({ frameIndex: fa.index, frame: fa.frame, items: fa.items }))
    .filter(o => o.items.length > 0)
}

function getCachePath(hash: string) {
  return path.join(CACHE_DIR, `${hash}.json`)
}

function loadCache(hash: string): ParseResult | null {
  const file = getCachePath(hash)
  if (!fs.existsSync(file)) return null
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (!data.deduplicated || !data.outfits) return null
    return data
  } catch {
    return null
  }
}

function saveCache(hash: string, result: ParseResult) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(getCachePath(hash), JSON.stringify(result, null, 2))
}

function validateOutfitCount(expected: number, actual: number): string | null {
  if (actual === expected) return null
  if (actual < expected) return `⚠️ 识别到 ${actual} 套，比预期 ${expected} 少 ${expected - actual} 套，可能有穿搭未被识别`
  return `⚠️ 识别到 ${actual} 套，比预期 ${expected} 多 ${actual - expected} 套，可能有帧重复识别了同一套`
}

async function runPipeline(url: string, taskId: string, outfitCount: number, fromCache: boolean) {
  const task = tasks.get(taskId)!
  const hash = urlHash(url)

  if (fromCache) {
    const cached = loadCache(hash)!

    updateStep(task, 'meta', '获取视频信息中...')
    await sleep(300)
    updateStep(task, 'meta', cached.meta?.title ?? '', 'done')

    updateStep(task, 'download', '开始下载...')
    await sleep(200)
    updateStep(task, 'download', '下载完成（缓存）', 'done')

    updateStep(task, 'frames', '提取关键帧中...')
    await sleep(200)
    updateStep(task, 'frames', `已提取 ${cached.frames.length} 帧`, 'done')

    updateStep(task, 'transcript', '音频转写中...')
    await sleep(200)
    updateStep(task, 'transcript', cached.transcript ? '转写完成' : '无音频，已跳过', 'done')

    updateStep(task, 'recognize', `识别中 (0/${cached.frames.length})...`)
    for (let i = 0; i < cached.frames.length; i++) {
      await sleep(100)
      updateStep(task, 'recognize', `识别中 (${i + 1}/${cached.frames.length})...`)
    }
    updateStep(task, 'recognize', `识别完成，共 ${cached.analysis.reduce((s, a) => s + a.items.length, 0)} 件衣物（缓存）`, 'done')

    task.status = 'done'
    task.cached = true
    task.result = { ...cached, taskId, outfitCount }
    return
  }

  const outputDir = path.join(process.cwd(), 'output', taskId)

  // 1. 元信息
  updateStep(task, 'meta', '获取视频信息中...')
  const meta = await parseMeta(url)
  updateStep(task, 'meta', meta.title, 'done')

  // 2. 下载
  updateStep(task, 'download', '开始下载...')
  const videoPath = await downloadVideo(url, outputDir, (detail) => {
    updateStep(task, 'download', detail)
  })
  updateStep(task, 'download', '下载完成', 'done')

  // 3. 按套数抽帧
  updateStep(task, 'frames', `按 ${outfitCount} 套抽取关键帧...`)
  const framePaths = await extractFramesByCount(videoPath, outputDir, outfitCount)
  updateStep(task, 'frames', `已提取 ${framePaths.length} 帧（目标 ${outfitCount} 套）`, 'done')

  // 4. 音频转写（博主口播 → 文字，用于辅助识别）
  updateStep(task, 'transcript', '提取音频中...')
  const audioPath = await extractAudio(videoPath, outputDir)
  let transcript: string | undefined
  if (audioPath) {
    updateStep(task, 'transcript', '音频转写中...')
    try {
      transcript = await transcribeAudio(audioPath, process.env.DASHSCOPE_API_KEY!)
      updateStep(task, 'transcript', `转写完成（${transcript.length} 字）`, 'done')
    } catch (err) {
      console.error('[transcribe] error:', err)
      updateStep(task, 'transcript', '转写失败，仅使用图片识别', 'done')
    }
  } else {
    updateStep(task, 'transcript', '无音频轨，已跳过', 'done')
  }

  // 5. AI 识别衣物（结合音频转写内容）
  updateStep(task, 'recognize', `识别中 (0/${framePaths.length})...`)
  const analysis = await analyzeFrames(framePaths, dashscopeClient, (current, total) => {
    updateStep(task, 'recognize', `识别中 (${current}/${total})...`)
  }, transcript)
  const totalRaw = analysis.reduce((sum, a) => sum + a.items.length, 0)

  const deduplicated = deduplicateItems(analysis)
  const outfits = buildOutfits(analysis)
  const validation = validateOutfitCount(outfitCount, outfits.length)

  const detail = `识别完成，共 ${totalRaw} 件 → 去重 ${deduplicated.length} 件，${outfits.length} 套搭配` +
    (validation ? ` | ${validation}` : ' | ✅ 套数匹配')
  updateStep(task, 'recognize', detail, 'done')

  const result: ParseResult = {
    taskId,
    outfitCount,
    meta,
    transcript,
    frames: framePaths.map(f => path.basename(f)),
    analysis,
    deduplicated,
    outfits,
    outputDir,
  }

  saveCache(hash, result)

  task.status = 'done'
  task.result = result
}

// POST /api/parse
app.post('/api/parse', async (c) => {
  const body = await c.req.json<{ url: string; outfitCount?: number }>()
  const { url } = body
  const outfitCount = Math.max(1, body.outfitCount || 1)

  if (!url) return c.json({ error: 'url is required' }, 400)

  const taskId = randomUUID().slice(0, 8)
  const hash = urlHash(url)
  const cached = loadCache(hash)

  const task: ParseTask = {
    id: taskId,
    url,
    outfitCount,
    status: 'processing',
    steps: DEFAULT_STEPS.map(s => ({ ...s, status: 'pending' })),
    createdAt: Date.now(),
  }
  tasks.set(taskId, task)

  runPipeline(url, taskId, outfitCount, !!cached).catch((err) => {
    const t = tasks.get(taskId)
    if (t) {
      t.status = 'error'
      t.error = err instanceof Error ? err.message : String(err)
      const proc = t.steps.find(s => s.status === 'processing')
      if (proc) {
        proc.status = 'error'
        proc.detail = t.error
      }
    }
  })

  return c.json({ taskId, status: 'processing', cached: !!cached })
})

// GET /api/parse/:taskId
app.get('/api/parse/:taskId', (c) => {
  const task = tasks.get(c.req.param('taskId'))
  if (!task) return c.json({ error: 'task not found' }, 404)
  return c.json(task)
})

// GET /api/frames/:taskId/:filename
app.get('/api/frames/:taskId/:filename', (c) => {
  const { taskId, filename } = c.req.param()

  const task = tasks.get(taskId)
  if (task?.result?.outputDir) {
    const filePath = path.join(task.result.outputDir, 'frames', filename)
    if (fs.existsSync(filePath)) {
      return new Response(fs.createReadStream(filePath) as any, {
        headers: { 'Content-Type': 'image/jpeg' },
      })
    }
  }

  const filePath = path.join(process.cwd(), 'output', taskId, 'frames', filename)
  if (!fs.existsSync(filePath)) return c.json({ error: 'frame not found' }, 404)
  return new Response(fs.createReadStream(filePath) as any, {
    headers: { 'Content-Type': 'image/jpeg' },
  })
})

// GET /api/status
app.get('/api/status', (c) => {
  return c.json({ ok: true, tasks: tasks.size })
})

export default app
