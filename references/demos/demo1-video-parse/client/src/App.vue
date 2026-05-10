<script setup lang="ts">
import { ref } from 'vue'

interface ProgressStep {
  name: string
  label: string
  status: 'pending' | 'processing' | 'done' | 'error'
  detail?: string
}

interface ParseTask {
  id: string
  url: string
  status: 'processing' | 'done' | 'error'
  steps: ProgressStep[]
  error?: string
  result?: {
    taskId: string
    meta?: {
      title: string
      description: string
      duration: number
      uploader: string
      thumbnail: string
    }
    frames: string[]
    audio?: string
  }
}

const url = ref('')
const taskId = ref('')
const task = ref<ParseTask | null>(null)
const loading = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

async function handleParse() {
  if (!url.value.trim()) return

  loading.value = true
  task.value = null

  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.value }),
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
  // 更快的轮询频率，1 秒一次，让进度更实时
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
  }, 1000)
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

function audioUrl() {
  return `/api/audio/${taskId.value}`
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function stepIcon(step: ProgressStep) {
  if (step.status === 'done') return '✓'
  if (step.status === 'error') return '✕'
  if (step.status === 'processing') return '...'
  return ''
}
</script>

<template>
  <div>
    <h1>Demo 1 — 视频链接解析</h1>
    <p class="subtitle">输入视频链接，自动解析元信息、提取关键帧和音频</p>

    <div class="input-group">
      <input
        v-model="url"
        placeholder="粘贴视频链接（YouTube / B站 / 抖音）"
        @keyup.enter="handleParse"
        :disabled="loading"
      />
      <button @click="handleParse" :disabled="loading || !url.trim()">
        {{ loading ? '解析中...' : '解析' }}
      </button>
    </div>

    <!-- 进度步骤 -->
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

    <div v-if="task?.status === 'error'" class="status error">
      解析失败：{{ task.error }}
    </div>

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
          <dt>描述</dt>
          <dd>{{ task.result.meta?.description || '无' }}</dd>
        </dl>
      </div>

      <div v-if="task.result.frames.length" class="card">
        <h2>关键帧 ({{ task.result.frames.length }} 张)</h2>
        <div class="frames-grid">
          <img
            v-for="frame in task.result.frames"
            :key="frame"
            :src="frameUrl(frame)"
            :alt="frame"
          />
        </div>
      </div>

      <div v-if="task.result.audio" class="card">
        <h2>音频</h2>
        <audio controls :src="audioUrl()"></audio>
      </div>
    </template>
  </div>
</template>
