<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

type Style = 'xiaohongshu' | 'science' | 'recommend' | 'travel'

interface DebugEntry {
  time: string
  step: string
  data: unknown
}

interface GenerateTask {
  id: string
  status: 'processing' | 'done' | 'error'
  style: Style
  inputType: 'text' | 'image'
  inputText?: string
  imageContext?: string
  content?: string
  error?: string
  debugLog?: DebugEntry[]
}

const STYLE_OPTIONS: { key: Style; label: string; desc: string }[] = [
  { key: 'xiaohongshu', label: '小红书', desc: '小红书博主风格，emoji 装饰，互动感强' },
  { key: 'science', label: '科普', desc: '科普作者风格，通俗易懂，有趣味性' },
  { key: 'recommend', label: '推荐', desc: '生活达人风格，推荐相关好物' },
  { key: 'travel', label: '攻略', desc: '旅行攻略风格，实用简洁' },
]

const task = ref<GenerateTask | null>(null)
const loading = ref(false)
const dragOver = ref(false)
const debugPanel = ref<HTMLElement | null>(null)
const isDark = ref(false)
const inputMode = ref<'text' | 'image'>('text')
const selectedStyle = ref<Style>('xiaohongshu')
const textInput = ref('')
const previewUrl = ref('')

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

async function handleTextSubmit() {
  const text = textInput.value.trim()
  if (!text) {
    alert('请输入内容描述')
    return
  }

  loading.value = true
  task.value = null

  try {
    const res = await fetch('/api/generate/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style: selectedStyle.value }),
    })
    const data = await res.json()
    startPolling(data.taskId)
  } catch (e) {
    loading.value = false
    alert('提交失败：' + (e instanceof Error ? e.message : String(e)))
  }
}

async function handleImage(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }

  previewUrl.value = URL.createObjectURL(file)
  loading.value = true
  task.value = null

  const formData = new FormData()
  formData.append('image', file)
  formData.append('style', selectedStyle.value)

  try {
    const res = await fetch('/api/generate/image', {
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
  if (input.files?.[0]) handleImage(input.files[0])
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (e.dataTransfer?.files?.[0]) handleImage(e.dataTransfer.files[0])
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
      if (file) {
        inputMode.value = 'image'
        handleImage(file)
      }
      break
    }
  }
}

function startPolling(id: string) {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/generate/${id}`)
      const data: GenerateTask = await res.json()
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

function copyContent() {
  if (task.value?.content) {
    navigator.clipboard.writeText(task.value.content)
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
    <div class="main-panel">
      <div class="header-row">
        <div>
          <h1>Demo 4 — 创意内容生成</h1>
          <p class="subtitle">输入图片或文字描述，AI 一键生成小红书/科普/推荐/攻略文案</p>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>

      <!-- 风格选择 -->
      <div class="style-row">
        <button
          v-for="s in STYLE_OPTIONS"
          :key="s.key"
          class="style-btn"
          :class="{ active: selectedStyle === s.key }"
          @click="selectedStyle = s.key"
          :title="s.desc"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- 输入模式切换 -->
      <div class="mode-tabs">
        <button class="mode-tab" :class="{ active: inputMode === 'text' }" @click="inputMode = 'text'">
          文字描述
        </button>
        <button class="mode-tab" :class="{ active: inputMode === 'image' }" @click="inputMode = 'image'">
          上传图片
        </button>
      </div>

      <!-- 文字输入 -->
      <div v-if="inputMode === 'text'" class="text-input-area">
        <textarea
          v-model="textInput"
          class="text-input"
          placeholder="输入场景描述、视频内容、图片信息等..."
          rows="4"
          @keydown.ctrl.enter="handleTextSubmit"
        ></textarea>
        <button class="submit-btn" @click="handleTextSubmit" :disabled="loading">
          生成内容
        </button>
      </div>

      <!-- 图片上传 -->
      <div
        v-else
        class="upload-area"
        :class="{ 'drag-over': dragOver, 'has-image': previewUrl }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <div v-if="!previewUrl" class="upload-placeholder">
          <div class="upload-icon">+</div>
          <p>拖拽图片到此处，点击选择，或 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴</p>
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
        <span>
          <template v-if="task?.inputType === 'image' && !task?.content">
            正在分析图片...
          </template>
          <template v-else>
            正在生成{{ STYLE_OPTIONS.find(s => s.key === selectedStyle)?.label }}内容...
          </template>
        </span>
      </div>

      <!-- 错误 -->
      <div v-if="task?.status === 'error'" class="status error">
        生成失败：{{ task.error }}
      </div>

      <!-- 结果 -->
      <template v-if="task?.status === 'done'">
        <!-- 图片分析上下文 -->
        <div v-if="task.imageContext" class="result-card context-card">
          <div class="result-label">图片分析结果</div>
          <div class="result-value">{{ task.imageContext }}</div>
        </div>

        <!-- 生成内容 -->
        <div v-if="task.content" class="result-card content-card">
          <div class="result-label-row">
            <span class="result-label">{{ STYLE_OPTIONS.find(s => s.key === task!.style)?.label }}文案</span>
            <button class="copy-btn" @click="copyContent" title="复制到剪贴板">复制</button>
          </div>
          <div class="generated-content">{{ task.content }}</div>
        </div>
      </template>
    </div>

    <!-- 调试面板 -->
    <div class="debug-panel">
      <div class="debug-header">AI 通信日志</div>
      <div ref="debugPanel" class="debug-body">
        <div v-if="!task || !task.debugLog || task.debugLog.length === 0" class="debug-empty">
          输入内容后，这里会实时显示 AI 生成过程
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
