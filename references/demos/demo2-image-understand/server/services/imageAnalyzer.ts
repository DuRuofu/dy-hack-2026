import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import type { DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const client = new OpenAI({
  apiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const SYSTEM_PROMPT = `请仔细分析这张图片，返回以下信息（用 JSON 格式）：
{
  "scene": "场景描述（一句话概括这是什么地方/什么场景）",
  "objects": ["画面中出现的主要物体/人物"],
  "text_ocr": "图片中出现的所有文字（没有则返回空字符串）",
  "mood": "画面的情绪/氛围",
  "tags": ["3-5个描述标签"]
}

只返回 JSON，不要其他内容。`

export interface AnalyzeResult {
  parsed: Record<string, unknown> | null
  raw: string
  debugLog: DebugEntry[]
}

export async function analyzeImage(imagePath: string): Promise<AnalyzeResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  // Step 1: 读取图片
  const imageBuffer = await fs.readFile(imagePath)
  const ext = path.extname(imagePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }
  const mimeType = mimeMap[ext] || 'image/jpeg'
  const base64 = imageBuffer.toString('base64')
  const base64Preview = base64.slice(0, 60) + '...'

  debugLog.push({
    time: now(),
    step: '读取图片',
    data: {
      path: imagePath,
      mimeType,
      size: `${(imageBuffer.length / 1024).toFixed(1)} KB`,
      base64Preview,
    },
  })

  // Step 2: 构造请求
  debugLog.push({
    time: now(),
    step: '构造请求',
    data: {
      model: 'qwen-vl-max',
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      prompt: SYSTEM_PROMPT,
      imageSize: `${(imageBuffer.length / 1024).toFixed(1)} KB`,
    },
  })

  // Step 3: 调用 AI
  debugLog.push({
    time: now(),
    step: '调用 DashScope API',
    data: { status: '请求中...' },
  })

  const response = await client.chat.completions.create({
    model: 'qwen-vl-max',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64}` },
        },
        {
          type: 'text',
          text: SYSTEM_PROMPT,
        },
      ],
    }],
  })

  const content = response.choices[0].message.content || '{}'

  debugLog.push({
    time: now(),
    step: '收到 AI 响应',
    data: {
      rawContent: content,
      usage: response.usage,
      model: response.model,
      finishReason: response.choices[0].finish_reason,
    },
  })

  // Step 4: 解析 JSON
  const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

  debugLog.push({
    time: now(),
    step: '解析 JSON',
    data: {
      cleanedInput: jsonStr,
    },
  })

  try {
    const parsed = JSON.parse(jsonStr)
    debugLog.push({
      time: now(),
      step: '解析成功',
      data: parsed,
    })
    return { parsed, raw: content, debugLog }
  } catch (err) {
    debugLog.push({
      time: now(),
      step: '解析失败，返回原始响应',
      data: { error: (err as Error).message },
    })
    return { parsed: null, raw: content, debugLog }
  }
}
