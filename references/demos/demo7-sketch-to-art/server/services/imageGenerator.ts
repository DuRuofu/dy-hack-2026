import type { DebugEntry } from '../types.js'

const apiKey = process.env.MINIMAX_API_KEY
if (!apiKey) {
  throw new Error('MINIMAX_API_KEY environment variable is required')
}

const API_URL = 'https://api.minimaxi.com/v1/image_generation'

export interface GenerateResult {
  imageBase64: string
  debugLog: DebugEntry[]
}

function now(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

async function callMiniMax(payload: Record<string, unknown>, debugLog: DebugEntry[]): Promise<string> {
  debugLog.push({
    time: now(),
    step: '调用 MiniMax 图片生成',
    data: {
      model: payload.model,
      mode: payload.subject_reference ? '图生图' : '文生图',
      promptPreview: String(payload.prompt).slice(0, 100),
    },
  })

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    debugLog.push({
      time: now(),
      step: 'API 错误',
      data: { status: resp.status, body: errText },
    })
    throw new Error(`MiniMax API error: ${resp.status} ${errText}`)
  }

  const data = await resp.json()

  debugLog.push({
    time: now(),
    step: '收到生成响应',
    data: {
      requestId: data.request_id,
      hasImages: !!data.data?.image_base64?.length,
    },
  })

  const images: string[] = data.data?.image_base64 || []
  if (images.length === 0) {
    throw new Error('API 未返回任何图片')
  }

  return images[0]
}

export async function textToImage(prompt: string, aspectRatio = '1:1'): Promise<GenerateResult> {
  const debugLog: DebugEntry[] = []
  const imageBase64 = await callMiniMax({
    model: 'image-01',
    prompt,
    aspect_ratio: aspectRatio,
    response_format: 'base64',
  }, debugLog)

  debugLog.push({
    time: now(),
    step: '文生图完成',
    data: { imageSize: `${Math.round(imageBase64.length / 1024)} KB` },
  })

  return { imageBase64, debugLog }
}

export async function imageToImage(
  sketchBase64: string,
  prompt: string,
  aspectRatio = '1:1',
): Promise<GenerateResult> {
  const debugLog: DebugEntry[] = []

  const imageBase64 = await callMiniMax({
    model: 'image-01',
    prompt,
    aspect_ratio: aspectRatio,
    subject_reference: [
      {
        type: 'character',
        image_file: `data:image/png;base64,${sketchBase64}`,
      },
    ],
    response_format: 'base64',
  }, debugLog)

  debugLog.push({
    time: now(),
    step: '图生图完成',
    data: { imageSize: `${Math.round(imageBase64.length / 1024)} KB` },
  })

  return { imageBase64, debugLog }
}
