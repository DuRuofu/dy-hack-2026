<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface SummarySegment {
  time: string
  topic: string
  key_points: string[]
}

interface VideoSummary {
  summary: string
  segments: SummarySegment[]
  tags: string[]
}

interface DebugEntry {
  time: string
  step: string
  data: unknown
}

interface SummaryTask {
  id: string
  status: 'processing' | 'done' | 'error'
  videoTitle?: string
  transcript?: TranscriptSegment[]
  fullText?: string
  summary?: VideoSummary
  error?: string
  debugLog?: DebugEntry[]
}

const task = ref<SummaryTask | null>(null)
const loading = ref(false)
const dragOver = ref(false)
const debugPanel = ref<HTMLElement | null>(null)
const isDark = ref(false)
const fileName = ref('')
const inputMode = ref<'url' | 'file'>('url')
const videoUrl = ref('')

let pollTimer: ReturnType<typeof setInterval> | null = null

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

function formatJson(data: unknown): string {
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const hasRealTimestamps = computed(() => {
  return (task.value?.transcript || []).some(seg => seg.end > 0)
})

watch(() => task.value?.debugLog?.length, () => {
  nextTick(() => {
    if (debugPanel.value) {
      debugPanel.value.scrollTop = debugPanel.value.scrollHeight
    }
  })
})

async function handleUrlSubmit() {
  const url = videoUrl.value.trim()
  if (!url) {
    alert('请输入视频链接')
    return
  }

  loading.value = true
  task.value = null
  fileName.value = ''

  try {
    const res = await fetch('/api/summary/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    startPolling(data.taskId)
  } catch (e) {
    loading.value = false
    alert('提交失败：' + (e instanceof Error ? e.message : String(e)))
  }
}

async function handleFile(file: File) {
  fileName.value = file.name
  loading.value = true
  task.value = null

  const formData = new FormData()
  formData.append('audio', file)

  try {
    const res = await fetch('/api/summary', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    startPolling(data.taskId)
  } catch (e) {
    loading.value = false
    alert('上传失败：' + (e instanceof Error ? e.message : String(e)))
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) handleFile(input.files[0])
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0])
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        inputMode.value = 'file'
        handleFile(file)
      }
      break
    }
  }
}

function startPolling(id: string) {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/summary/${id}`)
      const data: SummaryTask = await res.json()
      task.value = data

      if (data.status !== 'processing') {
        stopPolling()
        loading.value = false
      }
    } catch {
      stopPolling()
      loading.value = false
    }
  }, 2000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  document.addEventListener('paste', onPaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', onPaste)
})
</script>

<template>
  <div class="layout">
    <!-- 左侧：主内容 -->
    <div class="main-panel">
      <div class="header-row">
        <div>
          <h1>Demo 3 — 视频内容摘要</h1>
          <p class="subtitle">输入视频链接或上传音频，AI 自动转写并生成结构化内容摘要</p>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>

      <!-- 输入模式切换 -->
      <div class="mode-tabs">
        <button class="mode-tab" :class="{ active: inputMode === 'url' }" @click="inputMode = 'url'">
          视频链接
        </button>
        <button class="mode-tab" :class="{ active: inputMode === 'file' }" @click="inputMode = 'file'">
          上传音频
        </button>
      </div>

      <!-- URL 输入模式 -->
      <div v-if="inputMode === 'url'" class="url-input-area">
        <input
          v-model="videoUrl"
          type="text"
          class="url-input"
          placeholder="粘贴 YouTube / B站 / 抖音视频链接..."
          @keydown.enter="handleUrlSubmit"
        />
        <button class="url-submit" @click="handleUrlSubmit" :disabled="loading">
          开始分析
        </button>
      </div>

      <!-- 文件上传模式 -->
      <div
        v-else
        class="upload-area"
        :class="{ 'drag-over': dragOver, 'has-file': fileName }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <div v-if="!fileName" class="upload-placeholder">
          <div class="upload-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <p>拖拽音频文件到此处，点击选择，或 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴</p>
          <p class="upload-hint">支持 mp3 / wav / m4a / mp4 / webm 等格式</p>
          <input type="file" accept="audio/*,video/*" @change="onFileSelect" class="file-input" />
        </div>
        <div v-else class="file-info">
          <span class="file-name">{{ fileName }}</span>
          <input type="file" accept="audio/*,video/*" @change="onFileSelect" class="file-input-overlay" />
        </div>
      </div>

      <!-- 进度 -->
      <div v-if="loading" class="status">
        <span class="spinner"></span>
        <span>
          <template v-if="!task">
            {{ inputMode === 'url' ? '正在下载视频并提取音频...' : '正在上传...' }}
          </template>
          <template v-else-if="task.videoTitle && !task.transcript">
            正在转写「{{ task.videoTitle }}」...
          </template>
          <template v-else-if="!task.summary">
            正在生成摘要...
          </template>
        </span>
      </div>

      <!-- 视频标题 -->
      <div v-if="task?.videoTitle && task.status !== 'processing'" class="video-title">
        {{ task.videoTitle }}
      </div>

      <!-- 错误 -->
      <div v-if="task?.status === 'error'" class="status error">
        处理失败：{{ task.error }}
      </div>

      <!-- 结果 -->
      <template v-if="task?.status === 'done'">
        <!-- 摘要卡片 -->
        <div v-if="task.summary" class="result-card">
          <div class="result-section">
            <div class="result-label">视频摘要</div>
            <div class="result-value summary-text">{{ task.summary.summary }}</div>
          </div>

          <div v-if="task.summary.segments?.length" class="result-section">
            <div class="result-label">时间线分段</div>
            <div class="timeline">
              <div v-for="(seg, i) in task.summary.segments" :key="i" class="timeline-item">
                <div class="timeline-time">{{ seg.time }}</div>
                <div class="timeline-content">
                  <div class="timeline-topic">{{ seg.topic }}</div>
                  <ul class="timeline-points">
                    <li v-for="(point, j) in seg.key_points" :key="j">{{ point }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="task.summary.tags?.length" class="result-section">
            <div class="result-label">标签</div>
            <div class="tag-list">
              <span v-for="tag in task.summary.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- 转录文本 -->
        <div v-if="task.transcript?.length" class="result-card transcript-card">
          <div class="result-label">完整转录文本</div>
          <div class="transcript-list">
            <div v-for="(seg, i) in task.transcript" :key="i" class="transcript-seg">
              <span v-if="hasRealTimestamps" class="transcript-time">{{ formatTime(seg.start) }}</span>
              <span class="transcript-text">{{ seg.text }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 右侧：调试日志 -->
    <div class="debug-panel">
      <div class="debug-header">AI 通信日志</div>
      <div ref="debugPanel" class="debug-body">
        <div v-if="!task || !task.debugLog || task.debugLog.length === 0" class="debug-empty">
          输入视频链接或上传音频后，这里会实时显示处理过程
        </div>
        <div
          v-for="(entry, i) in task?.debugLog"
          :key="i"
          class="debug-entry"
          :class="{ 'debug-entry-last': i === (task?.debugLog?.length ?? 0) - 1 }"
        >
          <div class="debug-entry-header">
            <span class="debug-time">{{ entry.time }}</span>
            <span class="debug-step">{{ entry.step }}</span>
          </div>
          <pre class="debug-data">{{ formatJson(entry.data) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
