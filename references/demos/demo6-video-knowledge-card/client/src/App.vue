<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

type CardType = 'food' | 'travel' | 'career' | 'science' | 'unknown'

interface FoodCard {
  type: 'food'
  title: string
  difficulty: string
  time: string
  ingredients: string[]
  steps: string[]
  tips: string[]
  applicable: string
}

interface TravelCard {
  type: 'travel'
  title: string
  highlights: string[]
  route: string
  budget: string
  bestSeason: string
  tips: string[]
}

interface CareerCard {
  type: 'career'
  title: string
  corePoint: string
  keyPoints: string[]
  applicable: string
  example: string
}

interface ScienceCard {
  type: 'science'
  title: string
  oneLine: string
  details: string
  relatedExamples: string[]
  tags: string[]
}

interface UnknownCard {
  type: 'unknown'
  title: string
  summary: string
  keyPoints: string[]
  tags: string[]
}

type KnowledgeCard = FoodCard | TravelCard | CareerCard | ScienceCard | UnknownCard

interface DebugEntry {
  time: string
  step: string
  data: unknown
}

interface CardTask {
  id: string
  status: 'processing' | 'done' | 'error'
  videoTitle?: string
  card?: KnowledgeCard
  error?: string
  debugLog: DebugEntry[]
}

const task = ref<CardTask | null>(null)
const loading = ref(false)
const debugPanel = ref<HTMLElement | null>(null)
const isDark = ref(false)
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

function getCardTypeLabel(type: CardType): string {
  const labels: Record<CardType, string> = {
    food: '美食菜谱',
    travel: '旅行攻略',
    career: '职场技巧',
    science: '知识科普',
    unknown: '综合内容',
  }
  return labels[type] || '综合内容'
}

function getCardTypeIcon(type: CardType): string {
  const icons: Record<CardType, string> = {
    food: '🍳',
    travel: '✈️',
    career: '💼',
    science: '🔬',
    unknown: '📝',
  }
  return icons[type] || '📝'
}

function formatCardContent(card: KnowledgeCard): string {
  if (card.type === 'food') {
    let text = `🍳 ${card.title}\n`
    text += `难度：${card.difficulty} | 时长：${card.time}\n\n`
    text += `📝 步骤：\n`
    card.steps.forEach((step, i) => { text += `${i + 1}. ${step}\n` })
    text += `\n🥬 食材清单：\n`
    card.ingredients.forEach(ing => { text += `• ${ing}\n` })
    if (card.tips.length) {
      text += `\n💡 小贴士：\n`
      card.tips.forEach(tip => { text += `• ${tip}\n` })
    }
    text += `\n👨‍🍳 ${card.applicable}`
    return text
  }

  if (card.type === 'travel') {
    let text = `✈️ ${card.title}\n\n`
    text += `🏛️ 必去景点：\n`
    card.highlights.forEach(h => { text += `• ${h}\n` })
    text += `\n🗺️ 推荐路线：${card.route}\n`
    text += `💰 预算：${card.budget}\n`
    text += `🌤️ 最佳季节：${card.bestSeason}\n`
    if (card.tips.length) {
      text += `\n💡 注意事项：\n`
      card.tips.forEach(tip => { text += `• ${tip}\n` })
    }
    return text
  }

  if (card.type === 'career') {
    let text = `💼 ${card.title}\n`
    text += `📌 核心观点：${card.corePoint}\n\n`
    text += `📋 关键要点：\n`
    card.keyPoints.forEach((p, i) => { text += `${i + 1}. ${p}\n` })
    text += `\n🎯 适用场景：${card.applicable}\n`
    text += `\n💬 应用举例：${card.example}`
    return text
  }

  if (card.type === 'science') {
    let text = `🔬 ${card.title}\n`
    text += `📣 一句话解释：${card.oneLine}\n\n`
    text += `📖 详细说明：${card.details}\n`
    if (card.relatedExamples.length) {
      text += `\n🔗 相关例子：\n`
      card.relatedExamples.forEach(ex => { text += `• ${ex}\n` })
    }
    if (card.tags.length) {
      text += `\n🏷️ 标签：${card.tags.join(' / ')}`
    }
    return text
  }

  // unknown
  let text = `📝 ${card.title}\n\n`
  text += `${card.summary}\n\n`
  if (card.keyPoints.length) {
    text += `📌 关键要点：\n`
    card.keyPoints.forEach(p => { text += `• ${p}\n` })
  }
  if (card.tags.length) {
    text += `\n🏷️ 标签：${card.tags.join(' / ')}`
  }
  return text
}

watch(() => task.value?.debugLog?.length, () => {
  nextTick(() => {
    if (debugPanel.value) {
      debugPanel.value.scrollTop = debugPanel.value.scrollHeight
    }
  })
})

async function handleSubmit() {
  const url = videoUrl.value.trim()
  if (!url) {
    alert('请输入视频链接')
    return
  }

  loading.value = true
  task.value = null

  try {
    const res = await fetch('/api/card', {
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

function startPolling(id: string) {
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/card/${id}`)
      const data: CardTask = await res.json()
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

function copyContent() {
  if (task.value?.card) {
    const text = formatCardContent(task.value.card)
    navigator.clipboard.writeText(text)
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
          <h1>Demo 6 — 视频知识卡片</h1>
          <p class="subtitle">粘贴视频链接，AI 自动提取知识，生成可保存的结构化卡片</p>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
      </div>

      <!-- URL 输入 -->
      <div class="url-input-area">
        <input
          v-model="videoUrl"
          type="text"
          class="url-input"
          placeholder="粘贴 YouTube / B站 / 抖音视频链接..."
          @keydown.enter="handleSubmit"
          :disabled="loading"
        />
        <button class="url-submit" @click="handleSubmit" :disabled="loading">
          {{ loading ? '生成中...' : '生成卡片' }}
        </button>
      </div>

      <!-- 进度 -->
      <div v-if="loading" class="status">
        <span class="spinner"></span>
        <span>
          <template v-if="!task">正在下载视频...</template>
          <template v-else-if="!task.card">正在分析内容...</template>
          <template v-else>正在生成卡片...</template>
        </span>
      </div>

      <!-- 错误 -->
      <div v-if="task?.status === 'error'" class="status error">
        生成失败：{{ task.error }}
      </div>

      <!-- 知识卡片 -->
      <template v-if="task?.status === 'done' && task.card">
        <div class="card-header">
          <div class="card-type-badge">
            {{ getCardTypeIcon(task.card.type) }} {{ getCardTypeLabel(task.card.type) }}
          </div>
          <button class="copy-btn" @click="copyContent">复制全部</button>
        </div>

        <!-- 美食卡片 -->
        <template v-if="task.card.type === 'food'">
          <div class="knowledge-card food-card">
            <div class="card-title">{{ task.card.title }}</div>
            <div class="card-meta">{{ task.card.difficulty }} | {{ task.card.time }}</div>

            <div class="card-section">
              <div class="section-title">📝 步骤</div>
              <div class="step-list">
                <div v-for="(step, i) in task.card.steps" :key="i" class="step-item">
                  <span class="step-num">{{ i + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <div class="section-title">🥬 食材清单</div>
              <div class="ingredient-list">
                <span v-for="ing in task.card.ingredients" :key="ing" class="ingredient-tag">
                  {{ ing }}
                </span>
              </div>
            </div>

            <div v-if="task.card.tips.length" class="card-section">
              <div class="section-title">💡 小贴士</div>
              <div class="tips-list">
                <div v-for="(tip, i) in task.card.tips" :key="i" class="tip-item">
                  {{ tip }}
                </div>
              </div>
            </div>

            <div class="card-footer">
              👨‍🍳 {{ task.card.applicable }}
            </div>
          </div>
        </template>

        <!-- 旅行卡片 -->
        <template v-else-if="task.card.type === 'travel'">
          <div class="knowledge-card travel-card">
            <div class="card-title">{{ task.card.title }}</div>

            <div class="card-section">
              <div class="section-title">🏛️ 必去景点</div>
              <div class="highlight-list">
                <span v-for="h in task.card.highlights" :key="h" class="highlight-tag">
                  {{ h }}
                </span>
              </div>
            </div>

            <div class="card-meta-row">
              <div class="meta-item"><span class="meta-label">🗺️ 路线</span> {{ task.card.route }}</div>
              <div class="meta-item"><span class="meta-label">💰 预算</span> {{ task.card.budget }}</div>
              <div class="meta-item"><span class="meta-label">🌤️ 季节</span> {{ task.card.bestSeason }}</div>
            </div>

            <div v-if="task.card.tips.length" class="card-section">
              <div class="section-title">💡 注意事项</div>
              <div class="tips-list">
                <div v-for="(tip, i) in task.card.tips" :key="i" class="tip-item">
                  {{ tip }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 职场卡片 -->
        <template v-else-if="task.card.type === 'career'">
          <div class="knowledge-card career-card">
            <div class="card-title">{{ task.card.title }}</div>
            <div class="core-point">{{ task.card.corePoint }}</div>

            <div class="card-section">
              <div class="section-title">📋 关键要点</div>
              <div class="keypoints-list">
                <div v-for="(p, i) in task.card.keyPoints" :key="i" class="keypoint-item">
                  <span class="keypoint-num">{{ i + 1 }}</span>
                  <span>{{ p }}</span>
                </div>
              </div>
            </div>

            <div class="card-meta-row">
              <div class="meta-item"><span class="meta-label">🎯 适用</span> {{ task.card.applicable }}</div>
            </div>

            <div class="card-section">
              <div class="section-title">💬 应用举例</div>
              <div class="example-text">{{ task.card.example }}</div>
            </div>
          </div>
        </template>

        <!-- 科普卡片 -->
        <template v-else-if="task.card.type === 'science'">
          <div class="knowledge-card science-card">
            <div class="card-title">{{ task.card.title }}</div>
            <div class="one-line">{{ task.card.oneLine }}</div>

            <div class="card-section">
              <div class="section-title">📖 详细说明</div>
              <div class="details-text">{{ task.card.details }}</div>
            </div>

            <div v-if="task.card.relatedExamples.length" class="card-section">
              <div class="section-title">🔗 相关例子</div>
              <div class="examples-list">
                <span v-for="ex in task.card.relatedExamples" :key="ex" class="example-tag">
                  {{ ex }}
                </span>
              </div>
            </div>

            <div v-if="task.card.tags.length" class="card-tags">
              <span v-for="tag in task.card.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </template>

        <!-- 通用卡片 -->
        <template v-else>
          <div class="knowledge-card unknown-card">
            <div class="card-title">{{ task.card.title }}</div>
            <div class="summary-text">{{ task.card.summary }}</div>

            <div v-if="task.card.keyPoints.length" class="card-section">
              <div class="section-title">📌 关键要点</div>
              <div class="keypoints-list">
                <div v-for="(p, i) in task.card.keyPoints" :key="i" class="keypoint-item">
                  {{ p }}
                </div>
              </div>
            </div>

            <div v-if="task.card.tags.length" class="card-tags">
              <span v-for="tag in task.card.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- 右侧：调试日志 -->
    <div class="debug-panel">
      <div class="debug-header">AI 通信日志</div>
      <div ref="debugPanel" class="debug-body">
        <div v-if="!task || !task.debugLog || task.debugLog.length === 0" class="debug-empty">
          输入视频链接后，这里会实时显示处理过程
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
