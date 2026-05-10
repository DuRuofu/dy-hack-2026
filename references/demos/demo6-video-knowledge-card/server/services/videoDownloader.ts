import { execa } from 'execa'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import type { DebugEntry } from '../types.js'

export interface DownloadResult {
  audioPath: string
  videoTitle: string
  debugLog: DebugEntry[]
}

export async function downloadAndExtractAudio(
  url: string,
  outputDir: string,
): Promise<DownloadResult> {
  const debugLog: DebugEntry[] = []
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

  await fs.mkdir(outputDir, { recursive: true })
  const videoPath = path.join(outputDir, 'video.mp4')

  debugLog.push({
    time: now(),
    step: '获取视频信息',
    data: { url, status: '请求中...' },
  })

  const { stdout: metaJson } = await execa('yt-dlp', [
    '--dump-json',
    '--no-warnings',
    '--no-check-certificates',
    url,
  ])
  const meta = JSON.parse(metaJson)

  debugLog.push({
    time: now(),
    step: '获取视频信息完成',
    data: {
      title: meta.title,
      duration: meta.duration ? `${Math.round(meta.duration)}s` : 'unknown',
      uploader: meta.uploader || meta.uploader_id || '',
    },
  })

  debugLog.push({
    time: now(),
    step: '下载视频',
    data: { format: 'bestvideo+bestaudio/best', output: videoPath },
  })

  await execa('yt-dlp', [
    '--no-warnings',
    '--no-check-certificates',
    '-f', 'bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '-o', videoPath,
    url,
  ])

  const videoStat = await fs.stat(videoPath)
  debugLog.push({
    time: now(),
    step: '视频下载完成',
    data: { size: `${(videoStat.size / 1024 / 1024).toFixed(1)} MB` },
  })

  debugLog.push({
    time: now(),
    step: '提取音频',
    data: { status: '检查音轨...' },
  })

  const hasAudio = await new Promise<boolean>((resolve) => {
    ffmpeg.ffprobe(videoPath, (_err, data) => {
      resolve(data.streams.some(s => s.codec_type === 'audio'))
    })
  })

  if (!hasAudio) {
    debugLog.push({
      time: now(),
      step: '提取音频',
      data: { status: '视频无音轨，无法生成卡片' },
    })
    throw new Error('该视频没有音频流，无法生成知识卡片')
  }

  const audioPath = path.join(outputDir, 'audio.mp3')
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .save(audioPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run()
  })

  const audioStat = await fs.stat(audioPath)
  debugLog.push({
    time: now(),
    step: '音频提取完成',
    data: {
      path: audioPath,
      size: `${(audioStat.size / 1024).toFixed(1)} KB`,
    },
  })

  return {
    audioPath,
    videoTitle: meta.title || '',
    debugLog,
  }
}
