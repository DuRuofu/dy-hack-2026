export interface DebugEntry {
  time: string
  step: string
  data: unknown
}

export interface VideoContext {
  frames: string[]
  transcript: string
  videoTitle: string
  debugLog: DebugEntry[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface VideoSession {
  id: string
  status: 'loading' | 'ready' | 'error'
  videoTitle?: string
  frames?: string[]
  transcript?: string
  messages: ChatMessage[]
  error?: string
  createdAt: number
  debugLog: DebugEntry[]
}
