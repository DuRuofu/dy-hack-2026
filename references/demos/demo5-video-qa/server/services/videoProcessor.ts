import { execa } from 'execa'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import type { VideoContext, DebugEntry } from '../types.js'

const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  throw new Error('DASHSCOPE_API_KEY environment variable is required')
}

const DASHSCOPE_ASR_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'

export async function processVideo(url: string, outputDir: string): Promise<VideoContext> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })
  await fs.mkdir(outputDir, { recursive: true })

  // 1. 获取视频信息
  debugLog.push({ time: now(), step: '获取视频信息', data: { url } })
  const { stdout: metaJson } = await execa('yt-dlp', [
    '--dump-json', '--no-warnings', '--no-check-certificates', url,
  ])
  const meta = JSON.parse(metaJson)
  debugLog.push({
    time: now(), step: '视频信息获取完成',
    data: { title: meta.title, duration: meta.duration ? `${Math.round(meta.duration)}s` : 'unknown' },
  })

  // 2. 下载视频
  const videoPath = path.join(outputDir, 'video.mp4')
  debugLog.push({ time: now(), step: '下载视频', data: { status: '下载中...' } })
  await execa('yt-dlp', [
    '--no-warnings', '--no-check-certificates',
    '-f', 'bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '-o', videoPath, url,
  ])
  const videoStat = await fs.stat(videoPath)
  debugLog.push({ time: now(), step: '视频下载完成', data: { size: `${(videoStat.size / 1024 / 1024).toFixed(1)} MB` } })

  // 3. 抽帧 + 提取音频（并行）
  const framesDir = path.join(outputDir, 'frames')
  await fs.mkdir(framesDir, { recursive: true })

  debugLog.push({ time: now(), step: '并行处理：抽帧 + 提取音频', data: {} })

  const [, audioResult] = await Promise.all([
    // 抽帧：每 10 秒一帧
    new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions('-vf', 'fps=1/10')
        .output(path.join(framesDir, 'frame_%04d.jpg'))
        .on('end', () => resolve())
        .on('error', reject)
        .run()
    }),
    // 提取音频
    (async () => {
      const audioPath = path.join(outputDir, 'audio.mp3')
      const hasAudio = await new Promise<boolean>((resolve) => {
        ffmpeg.ffprobe(videoPath, (_err, data) => {
          resolve(data.streams.some(s => s.codec_type === 'audio'))
        })
      })
      if (!hasAudio) return null
      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath).noVideo().audioCodec('libmp3lame')
          .save(audioPath).on('end', () => resolve()).on('error', reject).run()
      })
      return audioPath
    })(),
  ])

  // 获取帧文件列表
  const frameFiles = (await fs.readdir(framesDir))
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .map(f => path.join(framesDir, f))

  debugLog.push({
    time: now(), step: '抽帧完成',
    data: { count: frameFiles.length, interval: '每 10 秒一帧' },
  })

  // 4. 音频转写
  let transcript = ''
  if (audioResult) {
    debugLog.push({ time: now(), step: '音频转写', data: { status: '调用 ASR...' } })
    const buffer = await fs.readFile(audioResult)
    const base64 = buffer.toString('base64')

    const resp = await fetch(DASHSCOPE_ASR_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3-asr-flash-2026-02-10',
        input: { messages: [{ role: 'user', content: [{ type: 'audio', audio: `data:audio/mpeg;base64,${base64}` }] }] },
      }),
    })
    const data = await resp.json()
    const contentArr = data.output?.choices?.[0]?.message?.content || []
    transcript = contentArr.map((c: any) => c.text || '').join('')
    debugLog.push({
      time: now(), step: '音频转写完成',
      data: { textLength: transcript.length, preview: transcript.slice(0, 100) + '...' },
    })
  } else {
    debugLog.push({ time: now(), step: '音频转写', data: { status: '视频无音轨，跳过' } })
  }

  return { frames: frameFiles, transcript, videoTitle: meta.title || '', debugLog }
}
