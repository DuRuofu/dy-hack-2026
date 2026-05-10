<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

interface ImageAnalysis {
  scene: string
  objects: string[]
  text_ocr: string
  mood: string
  tags: string[]
}

interface DebugEntry {
  time: string
  step: string
  data: unknown
}

interface AnalysisTask {
  id: string
  status: 'processing' | 'done' | 'error'
  result?: ImageAnalysis
  rawResponse?: string
  error?: string
  debugLog?: DebugEntry[]
}

const taskId = ref('')
const task = ref<AnalysisTask | null>(null)
const loading = ref(false)
const previewUrl = ref('')
const dragOver = ref(false)
const debugPanel = ref<HTMLElement | null>(null)
const isDark = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

function formatJson(data: unknown): string {
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

watch(() => task.value?.debugLog?.length, () => {
  nextTick(() => {
    if (debugPanel.value) {
      debugPanel.value.scrollTop = debugPanel.value.scrollHeight
    }
  })
})

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }

  previewUrl.value = URL.createObjectURL(file)
  loading.value = true
  task.value = null

  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    taskId.value = data.taskId
    startPolling()
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
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) handleFile(file)
      break
    }
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/analyze/${taskId.value}`)
      const data: AnalysisTask = await res.json()
      task.value = data

      if (data.status !== 'processing') {
        stopPolling()
        loading.value = false
      }
    } catch {
      stopPolling()
      loading.value = false
    }
  }, 1500)
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
          <h1>Demo 2 — 图片多模态理解</h1>
          <p class="subtitle">上传图片，AI 自动识别场景、物体、文字，并分析情绪和标签</p>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>

      <!-- 上传区域 -->
      <div
        class="upload-area"
        :class="{ 'drag-over': dragOver, 'has-image': previewUrl }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <div v-if="!previewUrl" class="upload-placeholder">
          <div class="upload-icon">+</div>
          <p>拖拽图片到此处，点击选择文件，或 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴</p>
          <input type="file" accept="image/*" @change="onFileSelect" class="file-input" />
        </div>
        <div v-else class="preview-container">
          <img :src="previewUrl" class="preview-image" alt="preview" />
          <input type="file" accept="image/*" @change="onFileSelect" class="file-input-overlay" />
        </div>
      </div>

      <!-- 进度 -->
      <div v-if="loading" class="status">
        <span class="spinner"></span>
        AI 正在分析图片...
      </div>

      <!-- 错误 -->
      <div v-if="task?.status === 'error'" class="status error">
        分析失败：{{ task.error }}
      </div>

      <!-- 结果 -->
      <template v-if="task?.status === 'done'">
        <div v-if="task.result" class="result-card">
          <div class="result-section">
            <div class="result-label">场景</div>
            <div class="result-value">{{ task.result.scene }}</div>
          </div>

          <div class="result-section">
            <div class="result-label">识别物体</div>
            <div class="tag-list">
              <span v-for="obj in task.result.objects" :key="obj" class="tag object-tag">
                {{ obj }}
              </span>
            </div>
          </div>

          <div v-if="task.result.text_ocr" class="result-section">
            <div class="result-label">OCR 文字</div>
            <div class="result-value ocr-text">{{ task.result.text_ocr }}</div>
          </div>

          <div class="result-section">
            <div class="result-label">情绪 / 氛围</div>
            <div class="result-value mood">{{ task.result.mood }}</div>
          </div>

          <div class="result-section">
            <div class="result-label">标签</div>
            <div class="tag-list">
              <span v-for="tag in task.result.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="task.rawResponse" class="result-card">
          <div class="result-label">AI 原始响应</div>
          <pre class="raw-response">{{ task.rawResponse }}</pre>
        </div>
      </template>
    </div>

    <!-- 右侧：调试日志 -->
    <div class="debug-panel">
      <div class="debug-header">AI 通信日志</div>
      <div ref="debugPanel" class="debug-body">
        <div v-if="!task || !task.debugLog || task.debugLog.length === 0" class="debug-empty">
          上传图片后，这里会实时显示与 AI 的通信过程
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
