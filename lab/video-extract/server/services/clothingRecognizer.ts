import fs from 'fs/promises'
import OpenAI from 'openai'
import type { ClothingItem, FrameAnalysis } from '../types.js'

const PROMPT = `你是一个专业的时尚穿搭识别助手。请仔细观察这张图片，识别其中所有的服装和配饰。

请以 JSON 数组格式返回，每个元素包含以下字段：
- category: 服装类别（如：上衣、裤子、裙子、外套、鞋子、包包、帽子、配饰等）
- color: 主要颜色
- style: 风格（如：休闲、运动、正式、韩系、日系、街头、复古等）
- season: 适合季节（春、夏、秋、冬、四季）
- description: 简短描述这件衣物的特点

如果图片中没有可识别的服装，返回空数组 []。
只返回 JSON，不要有其他文字。`

export async function recognizeClothing(
  imagePath: string,
  client: OpenAI,
): Promise<ClothingItem[]> {
  const imageBuffer = await fs.readFile(imagePath)
  const base64 = imageBuffer.toString('base64')

  const response = await client.chat.completions.create({
    model: 'qwen-vl-max',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
    max_tokens: 1024,
  })

  const text = response.choices[0]?.message?.content ?? '[]'

  // 提取 JSON（兼容 markdown code block 包裹的情况）
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  try {
    const items = JSON.parse(jsonMatch[0])
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export async function analyzeFrames(
  framePaths: string[],
  client: OpenAI,
  onProgress?: (current: number, total: number) => void,
): Promise<FrameAnalysis[]> {
  const results: FrameAnalysis[] = []

  for (let i = 0; i < framePaths.length; i++) {
    onProgress?.(i + 1, framePaths.length)
    const items = await recognizeClothing(framePaths[i], client)
    results.push({
      frame: framePaths[i].split('/').pop()!,
      index: i,
      items,
    })
  }

  return results
}
