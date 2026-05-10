import Anthropic from '@anthropic-ai/sdk'
import type { CardType, KnowledgeCard, TranscriptSegment, DebugEntry } from '../types.js'

const apiKey = process.env.MINIMAX_API_KEY
if (!apiKey) {
  throw new Error('MINIMAX_API_KEY environment variable is required')
}

const client = new Anthropic({
  apiKey,
  baseURL: 'https://api.minimaxi.com/anthropic',
})

// 视频类型识别关键词
const TYPE_KEYWORDS: Record<CardType, string[]> = {
  food: ['菜', '做法', '食谱', '烹饪', '炒', '煮', '炖', '烤', '美食', '吃', '食材', '厨房', '做饭', '教程'],
  travel: ['旅游', '旅行', '景点', '攻略', '打卡', '目的地', '路线', '拍照', '出行', '酒店', '签证'],
  career: ['职场', '工作', '面试', '简历', '晋升', '加薪', '沟通', '领导', '同事', '职业', '技能'],
  science: ['原理', '为什么', '科普', '知识', '解释', '科学', '宇宙', '物理', '化学', '生物', '历史'],
  unknown: [],
}

export interface ExtractResult {
  card: KnowledgeCard
  debugLog: DebugEntry[]
}

function detectCardType(title: string, text: string): CardType {
  const combined = (title + ' ' + text).toLowerCase()
  let maxScore = 0
  let detectedType: CardType = 'unknown'

  for (const [cardType, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (cardType === 'unknown') continue
    const score = keywords.filter(k => combined.includes(k)).length
    if (score > maxScore) {
      maxScore = score
      detectedType = cardType as CardType
    }
  }

  return detectedType
}

function buildPrompt(type: CardType, context: string): string {
  const prompts: Record<CardType, string> = {
    food: `你是一个美食教程分析专家。请从以下视频内容中提取菜谱信息，返回 JSON 格式。

要求：
- 只返回 JSON，不要其他内容
- 提取完整的菜谱信息，包括难度、时长、食材清单、步骤、小贴士

JSON 格式：
{
  "type": "food",
  "title": "菜名",
  "difficulty": "简单/中等/困难",
  "time": "烹饪时长",
  "ingredients": ["食材1（含用量）", "食材2"],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "tips": ["小贴士1", "小贴士2"],
  "applicable": "适合人群"
}

视频内容：
${context}`,

    travel: `你是一个旅行攻略分析专家。请从以下视频内容中提取旅行信息，返回 JSON 格式。

要求：
- 只返回 JSON，不要其他内容
- 提取景点、路线、预算、最佳季节、注意事项

JSON 格式：
{
  "type": "travel",
  "title": "目的地名称",
  "highlights": ["必去景点1", "必去景点2"],
  "route": "推荐路线",
  "budget": "预算参考",
  "bestSeason": "最佳季节",
  "tips": ["注意事项1", "注意事项2"]
}

视频内容：
${context}`,

    career: `你是一个职场技能分析专家。请从以下视频内容中提取职场技巧，返回 JSON 格式。

要求：
- 只返回 JSON，不要其他内容
- 提取核心观点、关键要点、适用场景、应用举例

JSON 格式：
{
  "type": "career",
  "title": "技巧名称",
  "corePoint": "一句话核心观点",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "applicable": "适用场景",
  "example": "应用举例"
}

视频内容：
${context}`,

    science: `你是一个知识科普专家。请从以下视频内容中提取知识点，返回 JSON 格式。

要求：
- 只返回 JSON，不要其他内容
- 提取知识点名称、一句话解释、详细说明、相关例子

JSON 格式：
{
  "type": "science",
  "title": "知识点名称",
  "oneLine": "一句话解释",
  "details": "详细说明（100字以内）",
  "relatedExamples": ["例子1", "例子2"],
  "tags": ["标签1", "标签2", "标签3"]
}

视频内容：
${context}`,

    unknown: `你是一个内容分析专家。请从以下视频内容中提取核心知识点，返回 JSON 格式。

要求：
- 只返回 JSON，不要其他内容
- 提取标题、摘要、关键要点、标签

JSON 格式：
{
  "type": "unknown",
  "title": "内容标题",
  "summary": "一句话总结",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "tags": ["标签1", "标签2"]
}

视频内容：
${context}`,
  }

  return prompts[type]
}

function parseCardJson(type: CardType, content: string): KnowledgeCard {
  const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  if (parsed.type !== type) {
    parsed.type = type
  }

  return parsed as KnowledgeCard
}

export async function extractCard(
  segments: TranscriptSegment[],
  videoTitle: string,
): Promise<ExtractResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  const hasRealTimestamps = segments.some(seg => seg.end > 0)
  let context = `视频标题：${videoTitle}\n\n=== 视频内容 ===\n`
  for (const seg of segments) {
    if (hasRealTimestamps) {
      const start = Math.round(seg.start)
      const end = Math.round(seg.end)
      context += `[${start}s-${end}s] ${seg.text}\n`
    } else {
      context += `${seg.text}\n`
    }
  }

  const cardType = detectCardType(videoTitle, context)
  debugLog.push({
    time: now(),
    step: '识别卡片类型',
    data: {
      type: cardType,
      videoTitle,
    },
  })

  const prompt = buildPrompt(cardType, context)

  debugLog.push({
    time: now(),
    step: '调用 MiniMax-M2.7 提取知识',
    data: {
      model: 'MiniMax-M2.7',
      promptPreview: prompt.slice(0, 200) + '...',
    },
  })

  const response = await client.messages.create({
    model: 'MiniMax-M2.7',
    max_tokens: 4096,
    messages: [
      { role: 'user', content: prompt },
    ],
  })

  const content = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('')

  debugLog.push({
    time: now(),
    step: '收到提取响应',
    data: {
      usage: response.usage,
      model: response.model,
      contentPreview: content.slice(0, 150) + '...',
    },
  })

  try {
    const card = parseCardJson(cardType, content)
    debugLog.push({
      time: now(),
      step: '知识卡片生成完成',
      data: card,
    })
    return { card, debugLog }
  } catch (err) {
    debugLog.push({
      time: now(),
      step: 'JSON 解析失败',
      data: {
        error: (err as Error).message,
        raw: content,
      },
    })
    return {
      card: {
        type: 'unknown',
        title: videoTitle || '未知内容',
        summary: content.slice(0, 200),
        keyPoints: [],
        tags: [],
      },
      debugLog,
    }
  }
}
