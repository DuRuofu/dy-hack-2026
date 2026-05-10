// 知识卡片类型定义

export type CardType = 'food' | 'travel' | 'career' | 'science' | 'unknown'

export interface FoodCard {
  type: 'food'
  title: string
  difficulty: string
  time: string
  ingredients: string[]
  steps: string[]
  tips: string[]
  applicable: string
}

export interface TravelCard {
  type: 'travel'
  title: string
  highlights: string[]
  route: string
  budget: string
  bestSeason: string
  tips: string[]
}

export interface CareerCard {
  type: 'career'
  title: string
  corePoint: string
  keyPoints: string[]
  applicable: string
  example: string
}

export interface ScienceCard {
  type: 'science'
  title: string
  oneLine: string
  details: string
  relatedExamples: string[]
  tags: string[]
}

export interface UnknownCard {
  type: 'unknown'
  title: string
  summary: string
  keyPoints: string[]
  tags: string[]
}

export type KnowledgeCard = FoodCard | TravelCard | CareerCard | ScienceCard | UnknownCard

export interface CardTask {
  id: string
  status: 'processing' | 'done' | 'error'
  videoTitle?: string
  card?: KnowledgeCard
  error?: string
  debugLog: DebugEntry[]
  createdAt: number
}

export interface DebugEntry {
  time: string
  step: string
  data: unknown
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}
