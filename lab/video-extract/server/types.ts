export interface VideoMeta {
  title: string
  description: string
  duration: number
  uploader: string
  thumbnail: string
  url: string
}

export interface ClothingItem {
  category: string
  color: string
  style: string
  season: string
  description: string
}

export interface FrameAnalysis {
  frame: string
  index: number
  items: ClothingItem[]
}

export interface OutfitSet {
  frameIndex: number
  frame: string
  items: ClothingItem[]
}

export interface ProgressStep {
  name: string
  label: string
  status: 'pending' | 'processing' | 'done' | 'error'
  detail?: string
}

export interface ParseTask {
  id: string
  url: string
  outfitCount: number
  status: 'processing' | 'done' | 'error'
  steps: ProgressStep[]
  result?: ParseResult
  error?: string
  createdAt: number
  cached?: boolean
}

export interface ParseResult {
  taskId: string
  outfitCount: number
  meta?: VideoMeta
  transcript?: string
  frames: string[]
  analysis: FrameAnalysis[]
  deduplicated: ClothingItem[]
  outfits: OutfitSet[]
  outputDir: string
}
