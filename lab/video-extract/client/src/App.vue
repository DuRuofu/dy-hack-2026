<script setup lang="ts">
import { ref } from 'vue'

interface ClothingItem {
  category: string
  color: string
  style: string
  season: string
  description: string
}

interface FrameAnalysis {
  frame: string
  index: number
  items: ClothingItem[]
}

interface OutfitSet {
  frameIndex: number
  frame: string
  items: ClothingItem[]
}

interface ProgressStep {
  name: string
  label: string
  status: 'pending' | 'processing' | 'done' | 'error'
  detail?: string
}

interface ParseTask {
  id: string
  url: string
  outfitCount: number
  status: 'processing' | 'done' | 'error'
  steps: ProgressStep[]
  cached?: boolean
  error?: string
  result?: {
    taskId: string
    outfitCount: number
    meta?: {
      title: string
      description: string
      duration: number
      uploader: string
    }
    frames: string[]
    analysis: FrameAnalysis[]
    deduplicated: ClothingItem[]
    outfits: OutfitSet[]
  }
}

const url = ref('')
const outfitCount = ref(4)
const taskId = ref('')
const task = ref<ParseTask | null>(null)
const loading = ref(false)
const activeTab = ref<'outfits' | 'frames'>('outfits')

let pollTimer: ReturnType<typeof setInterval> | null = null

async function handleParse() {
  if (!url.value.trim()) return

  loading.value = true
  task.value = null
  activeTab.value = 'outfits'

  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.value, outfitCount: outfitCount.value }),
    })
    const data = await res.json()
    taskId.value = data.taskId
    startPolling()
  } catch (e) {
    loading.value = false
    alert('请求失败：' + (e instanceof Error ? e.message : String(e)))
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/parse/${taskId.value}`)
      const data: ParseTask = await res.json()
      task.value = data

      if (data.status !== 'processing') {
        stopPolling()
        loading.value = false
      }
    } catch {
      stopPolling()
      loading.value = false
    }
  }, 500)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function frameUrl(filename: string) {
  return `/api/frames/${taskId.value}/${filename}`
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function totalRaw(analysis: FrameAnalysis[]) {
  return analysis.reduce((sum, a) => sum + a.items.length, 0)
}

function countMatch(expected: number, actual: number) {
  if (actual === expected) return { text: '✅ 套数匹配', ok: true }
  if (actual < expected) return { text: `⚠️ 少 ${expected - actual} 套`, ok: false }
  return { text: `⚠️ 多 ${actual - expected} 套`, ok: false }
}
</script>

<template>
  <div>
    <h1>Lab — 视频衣物提取验证</h1>
    <p class="subtitle">抖音/B站视频 → 按套数抽帧 → DashScope 多模态识别衣物</p>

    <div class="input-group">
      <input
        v-model="url"
        placeholder="粘贴视频链接（抖音 / B站）"
        @keyup.enter="handleParse"
        :disabled="loading"
      />
      <div class="count-input">
        <label>几套</label>
        <input
          type="number"
          v-model.number="outfitCount"
          min="1"
          max="30"
          :disabled="loading"
        />
      </div>
      <button @click="handleParse" :disabled="loading || !url.trim()">
        {{ loading ? '解析中...' : '开始验证' }}
      </button>
    </div>

    <!-- 缓存标记 -->
    <div v-if="task?.cached" class="cache-badge">⚡ 缓存命中，结果来自缓存</div>

    <!-- 进度 -->
    <div v-if="task?.steps?.length" class="progress-card">
      <div
        v-for="(step, index) in task.steps"
        :key="step.name"
        class="step"
        :class="step.status"
      >
        <div class="step-indicator">
          <div class="step-dot">
            <span v-if="step.status === 'done'" class="step-icon done">✓</span>
            <span v-else-if="step.status === 'error'" class="step-icon error">✕</span>
            <span v-else-if="step.status === 'processing'" class="step-icon processing"></span>
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          <div v-if="index < task.steps.length - 1" class="step-line" :class="step.status"></div>
        </div>
        <div class="step-content">
          <div class="step-label">{{ step.label }}</div>
          <div v-if="step.detail" class="step-detail">{{ step.detail }}</div>
        </div>
      </div>
    </div>

    <div v-if="task?.status === 'error'" class="status">
      解析失败：{{ task.error }}
    </div>

    <!-- 结果 -->
    <template v-if="task?.status === 'done' && task.result">
      <div class="card">
        <h2>视频信息</h2>
        <dl class="meta-grid">
          <dt>标题</dt>
          <dd>{{ task.result.meta?.title }}</dd>
          <dt>作者</dt>
          <dd>{{ task.result.meta?.uploader }}</dd>
          <dt>时长</dt>
          <dd>{{ formatDuration(task.result.meta?.duration ?? 0) }}</dd>
          <dt>预期套数</dt>
          <dd>
            {{ task.result.outfitCount }} 套
            <span
              :class="countMatch(task.result.outfitCount, task.result.outfits?.length ?? 0).ok ? 'match-ok' : 'match-warn'"
            >
              {{ countMatch(task.result.outfitCount, task.result.outfits?.length ?? 0).text }}
            </span>
          </dd>
        </dl>
      </div>

      <!-- 去重汇总 -->
      <div class="card" v-if="task.result.deduplicated?.length">
        <h2>衣物去重汇总 ({{ totalRaw(task.result.analysis) }} 件 → {{ task.result.deduplicated.length }} 件)</h2>
        <div class="dedup-grid">
          <div v-for="(item, i) in task.result.deduplicated" :key="i" class="clothing-item">
            <span class="tag">{{ item.category }}</span>
            {{ item.color }} · {{ item.style }} · {{ item.season }}
            <div style="margin-top: 4px; color: #666;">{{ item.description }}</div>
          </div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'outfits' }" @click="activeTab = 'outfits'">
          按套搭配 ({{ task.result.outfits?.length ?? 0 }} 套)
        </button>
        <button :class="{ active: activeTab === 'frames' }" @click="activeTab = 'frames'">
          按帧查看 ({{ task.result.frames.length }} 帧)
        </button>
      </div>

      <!-- 按套搭配 -->
      <div v-if="activeTab === 'outfits'" class="frames-layout">
        <div
          v-for="outfit in task.result.outfits"
          :key="outfit.frame"
          class="frame-card"
        >
          <img :src="frameUrl(outfit.frame)" :alt="outfit.frame" />
          <h3>第 {{ outfit.frameIndex + 1 }} 套 — {{ outfit.items.length }} 件</h3>
          <div class="clothing-list">
            <div v-for="(item, i) in outfit.items" :key="i" class="clothing-item">
              <span class="tag">{{ item.category }}</span>
              {{ item.color }} · {{ item.style }} · {{ item.season }}
              <div style="margin-top: 4px; color: #666;">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按帧查看 -->
      <div v-if="activeTab === 'frames'" class="frames-layout">
        <div
          v-for="fa in task.result.analysis"
          :key="fa.frame"
          class="frame-card"
        >
          <img :src="frameUrl(fa.frame)" :alt="fa.frame" />
          <h3>帧 {{ fa.index + 1 }} — {{ fa.items.length }} 件</h3>
          <div v-if="fa.items.length" class="clothing-list">
            <div v-for="(item, i) in fa.items" :key="i" class="clothing-item">
              <span class="tag">{{ item.category }}</span>
              {{ item.color }} · {{ item.style }} · {{ item.season }}
              <div style="margin-top: 4px; color: #666;">{{ item.description }}</div>
            </div>
          </div>
          <div v-else class="clothing-item">
            <span class="empty">未识别到衣物</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
