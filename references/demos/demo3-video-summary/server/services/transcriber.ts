import fs from 'fs'
import type { TranscriptSegment, DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'

export interface TranscribeResult {
  segments: TranscriptSegment[]
  fullText: string
  debugLog: DebugEntry[]
}

export async function transcribeAudio(audioPath: string): Promise<TranscribeResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  // Step 1: 读取音频文件
  const stat = fs.statSync(audioPath)
  debugLog.push({
    time: now(),
    step: '读取音频文件',
    data: {
      path: audioPath,
      size: `${(stat.size / 1024).toFixed(1)} KB`,
    },
  })

  // Step 2: base64 编码
  const buffer = fs.readFileSync(audioPath)
  const base64 = buffer.toString('base64')
  const ext = audioPath.split('.').pop()?.toLowerCase() || 'wav'
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4',
    ogg: 'audio/ogg', flac: 'audio/flac', aac: 'audio/aac',
  }
  const mimeType = mimeMap[ext] || 'audio/mpeg'

  debugLog.push({
    time: now(),
    step: '构造转写请求',
    data: {
      model: 'qwen3-asr-flash-2026-02-10',
      endpoint: DASHSCOPE_URL,
      mimeType,
      base64Length: base64.length,
    },
  })

  // Step 3: 调用 ASR API
  debugLog.push({
    time: now(),
    step: '调用 DashScope ASR',
    data: { status: '请求中...' },
  })

  const resp = await fetch(DASHSCOPE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen3-asr-flash-2026-02-10',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'audio',
                audio: `data:${mimeType};base64,${base64}`,
              },
            ],
          },
        ],
      },
    }),
  })

  const data = await resp.json()

  debugLog.push({
    time: now(),
    step: '收到 ASR 响应',
    data: {
      requestId: data.request_id,
      finishReason: data.output?.choices?.[0]?.finish_reason,
      annotations: data.output?.choices?.[0]?.message?.annotations,
    },
  })

  // Step 4: 提取文本和时间戳
  const contentArr = data.output?.choices?.[0]?.message?.content || []
  const fullText = contentArr.map((c: any) => c.text || '').join('')
  const annotations = data.output?.choices?.[0]?.message?.annotations || []

  // 尝试从 annotations 中提取真实时间戳（毫秒 → 秒）
  const segments: TranscriptSegment[] = []
  if (Array.isArray(annotations) && annotations.length > 0) {
    for (const ann of annotations) {
      if (ann.text && typeof ann.begin_time === 'number' && typeof ann.end_time === 'number') {
        segments.push({
          start: ann.begin_time / 1000,
          end: ann.end_time / 1000,
          text: ann.text,
        })
      }
    }
  }

  // 没有真实时间戳时，将全文作为单个 segment（不伪造时间）
  if (segments.length === 0 && fullText) {
    segments.push({ start: 0, end: 0, text: fullText })
  }

  debugLog.push({
    time: now(),
    step: '转写完成',
    data: {
      textLength: fullText.length,
      segmentsCount: segments.length,
      hasRealTimestamps: segments.length > 0 && segments[0].end > 0,
      fullText,
    },
  })

  return { segments, fullText, debugLog }
}
