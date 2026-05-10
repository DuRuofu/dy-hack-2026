import OpenAI from 'openai'
import type { TranscriptSegment, VideoSummary, DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const client = new OpenAI({
  apiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const SYSTEM_PROMPT = `你是一个视频内容分析专家。请基于以下带时间戳的音频转录文本，进行结构化分析。

返回以下 JSON 格式（只返回 JSON，不要其他内容）：
{
  "summary": "一句话概括视频核心内容",
  "segments": [
    {
      "time": "0-30s",
      "topic": "这个时间段的主题",
      "key_points": ["关键要点1", "关键要点2"]
    }
  ],
  "tags": ["标签1", "标签2", "标签3"]
}

分段规则：
- 按语义自然分段，每段 15-60 秒
- 每个分段提炼 1-3 个关键点
- 标签 3-6 个，涵盖视频主题和关键词`

export interface SummarizeResult {
  summary: VideoSummary
  debugLog: DebugEntry[]
}

export async function summarizeVideo(segments: TranscriptSegment[]): Promise<SummarizeResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  // Step 1: 构造上下文
  let context = '=== 音频转录（带时间戳）===\n'
  for (const seg of segments) {
    const start = Math.round(seg.start)
    const end = Math.round(seg.end)
    context += `[${start}s-${end}s] ${seg.text}\n`
  }

  debugLog.push({
    time: now(),
    step: '构造摘要上下文',
    data: {
      segmentsCount: segments.length,
      totalChars: context.length,
      preview: context.slice(0, 200) + '...',
    },
  })

  // Step 2: 调用 AI 摘要
  debugLog.push({
    time: now(),
    step: '调用 qwen-plus 生成摘要',
    data: {
      model: 'qwen-plus',
      status: '请求中...',
    },
  })

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ],
  })

  const content = response.choices[0].message.content || '{}'

  debugLog.push({
    time: now(),
    step: '收到摘要响应',
    data: {
      rawContent: content,
      usage: response.usage,
      model: response.model,
      finishReason: response.choices[0].finish_reason,
    },
  })

  // Step 3: 解析 JSON
  const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

  debugLog.push({
    time: now(),
    step: '解析摘要 JSON',
    data: { cleanedInput: jsonStr },
  })

  try {
    const parsed = JSON.parse(jsonStr) as VideoSummary
    debugLog.push({
      time: now(),
      step: '摘要生成完成',
      data: parsed,
    })
    return { summary: parsed, debugLog }
  } catch (err) {
    debugLog.push({
      time: now(),
      step: 'JSON 解析失败',
      data: { error: (err as Error).message, raw: content },
    })
    // 返回兜底结果
    return {
      summary: { summary: content, segments: [], tags: [] },
      debugLog,
    }
  }
}
