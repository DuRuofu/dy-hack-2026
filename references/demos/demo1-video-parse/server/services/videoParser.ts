import { execa } from 'execa'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import type { VideoMeta } from '../types.js'

export type ProgressCallback = (step: string, detail?: string, status?: 'processing' | 'done' | 'error') => void

export async function parseMeta(url: string): Promise<VideoMeta> {
  const { stdout } = await execa('yt-dlp', [
    '--dump-json',
    '--no-warnings',
    '--no-check-certificates',
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
    '-o', outputPath,
    url,
  ])

  // 捕获 yt-dlp 的进度输出
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

export async function extractFrames(
  videoPath: string,
  outputDir: string,
  intervalSeconds: number = 5,
): Promise<string[]> {
  const framesDir = path.join(outputDir, 'frames')
  await fs.mkdir(framesDir, { recursive: true })

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions('-vf', `fps=1/${intervalSeconds}`)
      .output(path.join(framesDir, 'frame_%04d.jpg'))
      .on('end', () => resolve())
      .on('error', reject)
      .run()
  })

  const files = await fs.readdir(framesDir)
  return files
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .map(f => path.join(framesDir, f))
}

export async function hasAudioStream(videoPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (_err, data) => {
      const hasAudio = data.streams.some(s => s.codec_type === 'audio')
      resolve(hasAudio)
    })
  })
}

export async function extractAudio(
  videoPath: string,
  outputDir: string,
): Promise<string | undefined> {
  const hasAudio = await hasAudioStream(videoPath)
  if (!hasAudio) return undefined

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

  return audioPath
}

export async function parseVideo(
  url: string,
  taskId: string,
  onProgress?: ProgressCallback,
) {
  const outputDir = path.join(process.cwd(), 'output', taskId)
  await fs.mkdir(outputDir, { recursive: true })

  // 1. 获取元信息
  onProgress?.('meta', '获取视频信息中...')
  const meta = await parseMeta(url)
  onProgress?.('meta', `${meta.title}`, 'done')

  // 2. 下载视频
  onProgress?.('download', '开始下载...')
  const videoPath = await downloadVideo(url, outputDir, (detail) => {
    onProgress?.('download', detail)
  })
  onProgress?.('download', '下载完成', 'done')

  // 3. 抽帧 + 提取音频（并行）
  onProgress?.('frames', '提取关键帧中...')
  onProgress?.('audio', '提取音频中...')

  const [frames, audio] = await Promise.all([
    extractFrames(videoPath, outputDir, 5).then((f) => {
      onProgress?.('frames', `已提取 ${f.length} 帧`, 'done')
      return f
    }),
    extractAudio(videoPath, outputDir).then((a) => {
      onProgress?.('audio', a ? '提取完成' : '无音频轨，已跳过', 'done')
      return a
    }),
  ])

  onProgress?.('done', '解析完成')

  return {
    meta,
    frames,
    audio,
    outputDir,
  }
}
