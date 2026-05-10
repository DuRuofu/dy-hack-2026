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

export interface AnalyzeResult {
  context: string
  debugLog: DebugEntry[]
}

export async function analyzeImage(imagePath: string): Promise<AnalyzeResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  const imageBuffer = await fs.readFile(imagePath)
  const ext = path.extname(imagePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  }
  const mimeType = mimeMap[ext] || 'image/jpeg'
  const base64 = imageBuffer.toString('base64')

  debugLog.push({
    time: now(),
    step: '分析图片内容',
    data: {
      model: 'qwen-vl-max',
      size: `${(imageBuffer.length / 1024).toFixed(1)} KB`,
    },
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
          text: '请详细描述这张图片的内容，包括场景、物体、人物、文字、色彩、氛围等，用一段连贯的文字描述。100-200字。',
        },
      ],
    }],
  })

  const context = response.choices[0].message.content || ''

  debugLog.push({
    time: now(),
    step: '图片分析完成',
    data: {
      usage: response.usage,
      contextLength: context.length,
      contextPreview: context.slice(0, 150) + '...',
    },
  })

  return { context, debugLog }
}
