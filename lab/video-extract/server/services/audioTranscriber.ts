import fs from 'fs/promises'

/**
 * 使用 DashScope 原生 API 调用 qwen-audio-turbo 模型进行音频转写
 * 返回格式: output.choices[0].message.content 可能是字符串或 content block 数组
 */
export async function transcribeAudio(
  audioPath: string,
  apiKey: string,
): Promise<string> {
  const audioBuffer = await fs.readFile(audioPath)
  const base64 = audioBuffer.toString('base64')
  const dataUri = `data:audio/mp3;base64,${base64}`

  const resp = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-audio-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { audio: dataUri },
                { text: '请将这段音频完整转写为文字，保留原始语言和口语化表达。只输出转写文字，不要有其他内容。' },
              ],
            },
          ],
        },
      }),
    },
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`DashScope native ASR failed (${resp.status}): ${err}`)
  }

  const data = await resp.json()
  const content = data.output?.choices?.[0]?.message?.content

  if (!content) return ''

  // content 可能是字符串，也可能是 [{text: "..."}, ...] 格式
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((b: any) => b.text)
      .map((b: any) => b.text)
      .join('\n')
  }

  return String(content)
}
