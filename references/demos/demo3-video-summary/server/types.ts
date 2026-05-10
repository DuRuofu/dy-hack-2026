export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface SummarySegment {
  time: string
  topic: string
  key_points: string[]
}

export interface VideoSummary {
  summary: string
  segments: SummarySegment[]
  tags: string[]
}

export interface DebugEntry {
  time: string
  step: string
  data: unknown
}

export interface SummaryTask {
  id: string
  status: 'processing' | 'done' | 'error'
  videoTitle?: string
  transcript?: TranscriptSegment[]
  fullText?: string
  summary?: VideoSummary
  error?: string
  createdAt: number
  debugLog: DebugEntry[]
}
