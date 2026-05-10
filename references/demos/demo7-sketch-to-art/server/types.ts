export interface GenerateTask {
  id: string
  status: 'processing' | 'done' | 'error'
  mode: 't2i' | 'i2i'
  prompt?: string
  resultImage?: string // base64
  error?: string
  debugLog: DebugEntry[]
  createdAt: number
}

export interface DebugEntry {
  time: string
  step: string
  data: unknown
}
