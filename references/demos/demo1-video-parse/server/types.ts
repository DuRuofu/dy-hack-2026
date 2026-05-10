export interface VideoMeta {
  title: string
  description: string
  duration: number
  uploader: string
  thumbnail: string
  url: string
}

export interface ProgressStep {
  name: string
  label: string
  status: 'pending' | 'processing' | 'done' | 'error'
  detail?: string
}

export interface VideoParseResult {
  taskId: string
  status: 'processing' | 'done' | 'error'
  error?: string
  meta?: VideoMeta
  frames: string[]
  audio?: string
  subtitles?: string
  outputDir: string
}

export interface ParseTask {
  id: string
  url: string
  status: 'processing' | 'done' | 'error'
  steps: ProgressStep[]
  result?: VideoParseResult
  error?: string
  createdAt: number
}
