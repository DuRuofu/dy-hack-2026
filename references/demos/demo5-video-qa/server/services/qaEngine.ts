import OpenAI from 'openai'
import fs from 'fs'
import type { ChatMessage, DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const client = new OpenAI({
  apiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

export interface QaResult {
  answer: string
  debugLog: DebugEntry[]
}

export async function answerQuestion(
  frames: string[],
  transcript: string,
  question: string,
  history: ChatMessage[],
): Promise<QaResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  // 选择最多 8 帧（间隔取样）
  const maxFrames = 8
  const selectedFrames = frames.length <= maxFrames
    ? frames
    : frames.filter((_, i) => i % Math.ceil(frames.length / maxFrames) === 0).slice(0, maxFrames)

  // 构造消息内容
  const content: any[] = []

  // 添加关键帧图片
  for (const framePath of selectedFrames) {
    const imgB64 = fs.readFileSync(framePath).toString('base64')
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${imgB64}` },
    })
  }

  // 添加转录文本 + 问题
  const systemContext = `你是视频内容分析助手。以下是视频的关键帧截图和音频转录文本，请基于这些内容回答用户的问题。

=== 音频转录 ===
${transcript || '（无音频转录）'}

请基于以上视频内容回答用户的问题。回答要准确、简洁。如果视频中没有相关信息，请诚实说明。`

  content.push({ type: 'text', text: systemContext })

  // 构造对话历史 + 当前问题
  const messages: any[] = []
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content })
  }
  messages.push({ role: 'user', content })

  debugLog.push({
    time: now(), step: '构造问答请求',
    data: {
      model: 'qwen-vl-max',
      framesUsed: selectedFrames.length,
      totalFrames: frames.length,
      transcriptLength: transcript.length,
      question,
      historyTurns: history.length,
    },
  })

  debugLog.push({ time: now(), step: '调用 qwen-vl-max', data: { status: '请求中...' } })

  const response = await client.chat.completions.create({
    model: 'qwen-vl-max',
    messages,
  })

  const answer = response.choices[0].message.content || ''

  debugLog.push({
    time: now(), step: '收到回答',
    data: {
      usage: response.usage,
      model: response.model,
      answerLength: answer.length,
      answerPreview: answer.slice(0, 150) + '...',
    },
  })

  return { answer, debugLog }
}
