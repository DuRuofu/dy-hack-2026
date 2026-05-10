import OpenAI from 'openai'
import type { Style, DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const client = new OpenAI({
  apiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const STYLE_NAMES: Record<Style, string> = {
  xiaohongshu: '小红书笔记',
  science: '科普解说',
  recommend: '好物推荐',
  travel: '旅行攻略',
}

const TEMPLATES: Record<Style, (context: string) => string> = {
  xiaohongshu: (ctx) => `你是一个小红书博主，请根据以下内容写一篇小红书笔记。

要求：
- 标题用「」包裹，要吸引眼球
- 正文 200-300 字，口语化，有互动感
- 适当使用 emoji 装饰
- 结尾带 3-5 个话题标签（#xxx 格式）
- 不要用 markdown 格式

内容：${ctx}`,

  science: (ctx) => `你是一个科普作者，请根据以下内容写一段科普解说。

要求：
- 通俗易懂，有趣味性
- 300 字左右
- 可以用比喻帮助理解
- 不要用 markdown 格式

内容：${ctx}`,

  recommend: (ctx) => `你是一个生活达人，请根据以下内容给出相关推荐。

要求：
- 推荐 3-5 个相关项目
- 每个推荐包含名称和推荐理由
- 语气亲切自然
- 不要用 markdown 格式

内容：${ctx}`,

  travel: (ctx) => `你是一个旅行攻略作者，请根据以下内容生成旅行攻略要点。

要求：
- 实用、简洁
- 包含必去景点、必吃美食、注意事项
- 给出简短的行程建议
- 不要用 markdown 格式

内容：${ctx}`,
}

export interface GenerateResult {
  content: string
  debugLog: DebugEntry[]
}

export async function generateContent(
  context: string,
  style: Style,
): Promise<GenerateResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  const prompt = TEMPLATES[style](context)

  debugLog.push({
    time: now(),
    step: '构造生成请求',
    data: {
      model: 'qwen-plus',
      style: STYLE_NAMES[style],
      promptPreview: prompt.slice(0, 200) + '...',
    },
  })

  debugLog.push({
    time: now(),
    step: '调用 qwen-plus 生成内容',
    data: { status: '请求中...' },
  })

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      { role: 'user', content: prompt },
    ],
  })

  const content = response.choices[0].message.content || ''

  debugLog.push({
    time: now(),
    step: '收到生成响应',
    data: {
      usage: response.usage,
      model: response.model,
      finishReason: response.choices[0].finish_reason,
      contentLength: content.length,
    },
  })

  debugLog.push({
    time: now(),
    step: '生成完成',
    data: {
      style: STYLE_NAMES[style],
      contentPreview: content.slice(0, 150) + '...',
    },
  })

  return { content, debugLog }
}
