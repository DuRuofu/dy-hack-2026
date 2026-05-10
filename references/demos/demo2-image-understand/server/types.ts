export interface ImageAnalysis {
  scene: string
  objects: string[]
  text_ocr: string
  mood: string
  tags: string[]
}

export interface DebugEntry {
  time: string
  step: string
  data: unknown
}

export interface AnalysisTask {
  id: string
  status: 'processing' | 'done' | 'error'
  result?: ImageAnalysis
  rawResponse?: string
  error?: string
  createdAt: number
  debugLog: DebugEntry[]
}
