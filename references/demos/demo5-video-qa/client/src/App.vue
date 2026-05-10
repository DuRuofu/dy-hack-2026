<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

interface DebugEntry {
  time: string
  step: string
  data: unknown
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SessionInfo {
  id: string
  status: 'loading' | 'ready' | 'error'
  videoTitle?: string
  framesCount: number
  transcriptLength: number
  messages: ChatMessage[]
  error?: string
  debugLog: DebugEntry[]
}

const videoUrl = ref('')
const sessionId = ref<string | null>(null)
const sessionStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const videoTitle = ref('')
const framesCount = ref(0)
const messages = ref<ChatMessage[]>([])
const question = ref('')
const error = ref('')
const debugLog = ref<DebugEntry[]>([])
const isDark = ref(false)
const chatPanel = ref<HTMLElement | null>(null)
const debugPanel = ref<HTMLElement | null>(null)
const asking = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

function formatJson(data: unknown): string {
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

watch(() => debugLog.value.length, () => {
  nextTick(() => {
    if (debugPanel.value) {
      debugPanel.value.scrollTop = debugPanel.value.scrollHeight
    }
  })
})

watch(() => messages.value.length, () => {
  nextTick(() => {
    if (chatPanel.value) {
      chatPanel.value.scrollTop = chatPanel.value.scrollHeight
    }
  })
})

async function createSession() {
  const url = videoUrl.value.trim()
  if (!url) {
    alert('请输入视频链接')
    return
  }

  sessionStatus.value = 'loading'
  messages.value = []
  error.value = ''
  debugLog.value = []
  videoTitle.value = ''
  framesCount.value = 0

  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    if (data.error) {
      error.value = data.error
      sessionStatus.value = 'error'
      return
    }
    sessionId.value = data.sessionId
    startPolling(data.sessionId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    sessionStatus.value = 'error'
  }
}

function startPolling(id: string) {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/session/${id}`)
      const data: SessionInfo = await res.json()
      debugLog.value = data.debugLog || []
      videoTitle.value = data.videoTitle || ''
      framesCount.value = data.framesCount || 0

      if (data.status === 'ready') {
        sessionStatus.value = 'ready'
        stopPolling()
      } else if (data.status === 'error') {
        sessionStatus.value = 'error'
        error.value = data.error || '处理失败'
        stopPolling()
      }
    } catch {
      stopPolling()
      sessionStatus.value = 'error'
      error.value = '查询状态失败'
    }
  }, 2000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function askQuestion() {
  const q = question.value.trim()
  if (!q || !sessionId.value || sessionStatus.value !== 'ready' || asking.value) return

  asking.value = true
  question.value = ''

  // 先添加用户消息
  messages.value.push({ role: 'user', content: q })

  try {
    const res = await fetch(`/api/session/${sessionId.value}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
    const data = await res.json()

    if (data.error) {
      messages.value.push({ role: 'assistant', content: '⚠️ ' + data.error })
    } else {
      messages.value.push({ role: 'assistant', content: data.answer })
    }

    // 刷新 debug log
    const statusRes = await fetch(`/api/session/${sessionId.value}`)
    const statusData: SessionInfo = await statusRes.json()
    debugLog.value = statusData.debugLog || []
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '⚠️ 请求失败：' + (e instanceof Error ? e.message : String(e)) })
  } finally {
    asking.value = false
    nextTick(() => {
      if (chatPanel.value) chatPanel.value.scrollTop = chatPanel.value.scrollHeight
    })
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    askQuestion()
  }
}

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="layout">
    <!-- 左侧：主内容 -->
    <div class="main-panel">
      <div class="header-row">
        <div>
          <h1>Demo 5 — 视频问答</h1>
          <p class="subtitle">输入视频链接，AI 提取关键帧和音频转录，然后对视频内容进行提问</p>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>

      <!-- 视频链接输入 -->
      <div class="url-input-area">
        <input
          v-model="videoUrl"
          type="text"
          class="url-input"
          placeholder="粘贴 YouTube / B站 / 抖音视频链接..."
          @keydown.enter="createSession"
          :disabled="sessionStatus === 'loading'"
        />
        <button class="url-submit" @click="createSession" :disabled="sessionStatus === 'loading'">
          {{ sessionStatus === 'loading' ? '处理中...' : '加载视频' }}
        </button>
      </div>

      <!-- 进度 -->
      <div v-if="sessionStatus === 'loading'" class="status">
        <span class="spinner"></span>
        <span>
          正在下载视频、提取关键帧和音频转录...
        </span>
      </div>

      <!-- 视频标题 -->
      <div v-if="videoTitle && sessionStatus === 'ready'" class="video-title">
        {{ videoTitle }} <span class="frame-count">（{{ framesCount }} 帧）</span>
      </div>

      <!-- 错误 -->
      <div v-if="sessionStatus === 'error'" class="status error">
        处理失败：{{ error }}
      </div>

      <!-- 聊天区域 -->
      <div v-if="sessionStatus === 'ready'" class="chat-section">
        <div ref="chatPanel" class="chat-messages">
          <div v-if="messages.length === 0" class="chat-empty">
            视频加载完成，请在下方输入框中提问关于视频内容的问题
          </div>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="chat-message"
            :class="msg.role"
          >
            <div class="chat-avatar">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
            <div class="chat-bubble">{{ msg.content }}</div>
          </div>
        </div>

        <div class="chat-input-area">
          <textarea
            v-model="question"
            class="chat-input"
            placeholder="输入关于视频内容的问题，按 Enter 发送..."
            rows="1"
            @keydown="onKeydown"
            :disabled="asking"
          ></textarea>
          <button class="chat-send" @click="askQuestion" :disabled="asking || !question.trim()">
            {{ asking ? '...' : '发送' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧：调试日志 -->
    <div class="debug-panel">
      <div class="debug-header">AI 通信日志</div>
      <div ref="debugPanel" class="debug-body">
        <div v-if="debugLog.length === 0" class="debug-empty">
          输入视频链接后，这里会实时显示处理过程
        </div>
        <div
          v-for="(entry, i) in debugLog"
          :key="i"
          class="debug-entry"
          :class="{ 'debug-entry-last': i === debugLog.length - 1 }"
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
