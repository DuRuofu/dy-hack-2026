export type Style = 'xiaohongshu' | 'science' | 'recommend' | 'travel'

export interface DebugEntry {
  time: string
  step: string
  data: unknown
}

export interface GenerateTask {
  id: string
  status: 'processing' | 'done' | 'error'
  style: Style
  inputType: 'text' | 'image'
  inputText?: string
  imageContext?: string
  content?: string
  error?: string
  createdAt: number
  debugLog: DebugEntry[]
}
