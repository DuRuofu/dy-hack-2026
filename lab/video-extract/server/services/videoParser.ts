import { execa } from 'execa'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import type { VideoMeta } from '../types.js'

export type ProgressCallback = (step: string, detail?: string, status?: 'processing' | 'done' | 'error') => void

const COOKIE_ARGS = ['--cookies', 'cookies.txt']

export async function parseMeta(url: string): Promise<VideoMeta> {
  const { stdout } = await execa('yt-dlp', [
    '--dump-json',
    '--no-warnings',
    '--no-check-certificates',
    ...COOKIE_ARGS,
    url,
  ])

  const info = JSON.parse(stdout)

  return {
    title: info.title ?? '',
    description: info.description ?? '',
    duration: info.duration ?? 0,
    uploader: info.uploader ?? info.uploader_id ?? '',
    thumbnail: info.thumbnail ?? '',
    url,
  }
}

export async function downloadVideo(
  url: string,
  outputDir: string,
  onProgress?: (detail: string) => void,
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'video.mp4')

  const proc = execa('yt-dlp', [
    '--no-warnings',
    '--no-check-certificates',
    '-f', 'bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--progress',
    ...COOKIE_ARGS,
    '-o', outputPath,
    url,
  ])

  proc.stderr?.on('data', (chunk: Buffer) => {
    const line = chunk.toString()
    const match = line.match(/(\d+\.?\d*)%/)
    if (match && onProgress) {
      onProgress(`下载中 ${match[1]}%`)
    }
  })

  await proc
  return outputPath
}

function getDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, data) => {
      if (err) return reject(err)
      resolve(data.format.duration ?? 0)
    })
  })
}

export async function extractFramesByCount(
  videoPath: string,
  outputDir: string,
  count: number,
): Promise<string[]> {
  const framesDir = path.join(outputDir, 'frames')
  await fs.mkdir(framesDir, { recursive: true })

  const duration = await getDuration(videoPath)

  // 跳过开头 2s 和结尾 2s，避免片头片尾
  const margin = Math.min(2, duration * 0.05)
  const usableStart = margin
  const usableEnd = duration - margin
  const usableDuration = usableEnd - usableStart

  if (count <= 0 || usableDuration <= 0) {
    // 回退：只取一帧
    count = 1
  }

  // 计算每套穿搭的等分时间点，取每段的中间位置
  const segmentDuration = usableDuration / count
  const timestamps: number[] = []
  for (let i = 0; i < count; i++) {
    const midpoint = usableStart + segmentDuration * (i + 0.5)
    timestamps.push(Math.round(midpoint * 100) / 100)
  }

  // 逐帧提取（更可靠，避免 select 滤镜的兼容性问题）
  for (let i = 0; i < timestamps.length; i++) {
    const outFile = path.join(framesDir, `frame_${String(i + 1).padStart(4, '0')}.jpg`)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamps[i])
        .outputOptions('-frames:v', '1', '-q:v', '2')
        .output(outFile)
        .on('end', () => resolve())
        .on('error', reject)
        .run()
    })
  }

  const files = await fs.readdir(framesDir)
  return files
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .map(f => path.join(framesDir, f))
}

export async function extractAudio(
  videoPath: string,
  outputDir: string,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (_err, data) => {
      const hasAudio = data?.streams?.some(s => s.codec_type === 'audio')
      if (!hasAudio) {
        resolve(undefined)
        return
      }

      const audioPath = path.join(outputDir, 'audio.mp3')
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .save(audioPath)
        .on('end', () => resolve(audioPath))
        .on('error', () => resolve(undefined))
        .run()
    })
  })
}
