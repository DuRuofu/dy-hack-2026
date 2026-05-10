<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const resultImg = ref('')
const prompt = ref('')
const generating = ref(false)
const statusText = ref('')
const brushSize = ref(4)
const brushColor = ref('#000000')
const bgColor = ref('#ffffff')
const mode = ref<'t2i' | 'i2i'>('i2i')
const showDebug = ref(false)
const debugLog = ref<any[]>([])

let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let lastX = 0
let lastY = 0
let undoStack: ImageData[] = []
const MAX_UNDO = 20

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  clearCanvas(false)
}

function clearCanvas(save = true) {
  if (!ctx || !canvasRef.value) return
  if (save) saveUndo()
  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

function saveUndo() {
  if (!ctx || !canvasRef.value) return
  const data = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
  undoStack.push(data)
  if (undoStack.length > MAX_UNDO) undoStack.shift()
}

function undo() {
  if (!ctx || undoStack.length === 0) return
  const data = undoStack.pop()!
  ctx.putImageData(data, 0, 0)
}

function getCanvasPos(e: MouseEvent | Touch) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function startDraw(e: MouseEvent | TouchEvent) {
  drawing = true
  saveUndo()
  const touch = 'touches' in e ? e.touches[0] : e
  const pos = getCanvasPos(touch)
  lastX = pos.x
  lastY = pos.y
}

function draw(e: MouseEvent | TouchEvent) {
  if (!drawing || !ctx) return
  const touch = 'touches' in e ? e.touches[0] : e
  const pos = getCanvasPos(touch)

  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(pos.x, pos.y)
  ctx.strokeStyle = brushColor.value
  ctx.lineWidth = brushSize.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  lastX = pos.x
  lastY = pos.y
}

function stopDraw() {
  drawing = false
}

function getCanvasBase64(): string {
  const canvas = canvasRef.value!
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}

async function generate() {
  if (generating.value) return

  const canvas = canvasRef.value!
  const sketch = getCanvasBase64()

  generating.value = true
  resultImg.value = ''
  debugLog.value = []
  statusText.value = '生成中...'

  try {
    const body: Record<string, unknown> = {}

    if (mode.value === 'i2i') {
      body.image = sketch
      body.prompt = prompt.value || '将这幅涂鸦转化为精美的艺术画作'
    } else {
      if (!prompt.value) {
        statusText.value = '文生图模式需要输入描述'
        generating.value = false
        return
      }
      body.prompt = prompt.value
    }

    body.aspect_ratio = '1:1'

    const res = await fetch(`/api/generate/${mode.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const { taskId } = await res.json()

    // Poll for result
    const poll = async () => {
      const r = await fetch(`/api/generate/${taskId}`)
      const task = await r.json()

      if (task.status === 'done') {
        resultImg.value = `data:image/jpeg;base64,${task.resultImage}`
        debugLog.value = task.debugLog || []
        statusText.value = '生成完成!'
        generating.value = false
      } else if (task.status === 'error') {
        statusText.value = `错误: ${task.error}`
        debugLog.value = task.debugLog || []
        generating.value = false
      } else {
        setTimeout(poll, 2000)
      }
    }

    setTimeout(poll, 2000)
  } catch (err) {
    statusText.value = `请求失败: ${err instanceof Error ? err.message : String(err)}`
    generating.value = false
  }
}

function downloadResult() {
  if (!resultImg.value) return
  const a = document.createElement('a')
  a.href = resultImg.value
  a.download = `sketch-art-${Date.now()}.jpg`
  a.click()
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault()
    undo()
  }
}

onMounted(() => {
  nextTick(initCanvas)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app">
    <header>
      <h1>涂鸦变画作</h1>
      <p class="subtitle">在画板上涂鸦，AI 为你生成精美画作</p>
    </header>

    <main>
      <div class="panel left">
        <div class="toolbar">
          <div class="tool-group">
            <label>笔刷</label>
            <input type="range" v-model.number="brushSize" min="1" max="40" />
            <span class="size-label">{{ brushSize }}px</span>
          </div>
          <div class="tool-group">
            <label>颜色</label>
            <input type="color" v-model="brushColor" />
          </div>
          <div class="tool-group">
            <label>背景</label>
            <input type="color" v-model="bgColor" @change="clearCanvas(true)" />
          </div>
          <div class="btn-group">
            <button @click="undo" title="撤销 (Ctrl+Z)">撤销</button>
            <button @click="clearCanvas(true)" class="danger">清空</button>
          </div>
        </div>

        <canvas
          ref="canvasRef"
          width="512"
          height="512"
          @mousedown.prevent="startDraw"
          @mousemove="draw"
          @mouseup="stopDraw"
          @mouseleave="stopDraw"
          @touchstart.prevent="startDraw"
          @touchmove.prevent="draw"
          @touchend="stopDraw"
        />
      </div>

      <div class="center">
        <div class="mode-toggle">
          <button
            :class="{ active: mode === 'i2i' }"
            @click="mode = 'i2i'"
          >涂鸦生图</button>
          <button
            :class="{ active: mode === 't2i' }"
            @click="mode = 't2i'"
          >纯文生图</button>
        </div>

        <textarea
          v-model="prompt"
          :placeholder="mode === 'i2i' ? '描述你想要的效果（可选）' : '描述你想生成的图片'"
          rows="3"
        />

        <button
          class="generate-btn"
          @click="generate"
          :disabled="generating"
        >
          {{ generating ? '生成中...' : '生成画作' }}
        </button>

        <p class="status" v-if="statusText">{{ statusText }}</p>
      </div>

      <div class="panel right">
        <div class="result-area">
          <img
            v-if="resultImg"
            :src="resultImg"
            alt="生成结果"
          />
          <div v-else class="placeholder">
            <p>生成的画作将显示在这里</p>
          </div>
        </div>
        <button
          v-if="resultImg"
          class="download-btn"
          @click="downloadResult"
        >下载图片</button>

        <details v-if="debugLog.length" class="debug">
          <summary>调试日志</summary>
          <div v-for="(entry, i) in debugLog" :key="i" class="debug-entry">
            <span class="time">{{ entry.time }}</span>
            <span class="step">{{ entry.step }}</span>
            <pre v-if="entry.data">{{ typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2) }}</pre>
          </div>
        </details>
      </div>
    </main>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0f0f0f;
  color: #e0e0e0;
  min-height: 100vh;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 24px;
}

header h1 {
  font-size: 28px;
  background: linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #888;
  margin-top: 4px;
  font-size: 14px;
}

main {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.center {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: #1a1a1a;
  border-radius: 8px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tool-group label {
  color: #999;
  white-space: nowrap;
}

.tool-group input[type="range"] {
  width: 80px;
  accent-color: #4d96ff;
}

.tool-group input[type="color"] {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.size-label {
  font-size: 12px;
  color: #666;
  min-width: 32px;
}

.btn-group {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.btn-group button, .generate-btn, .download-btn {
  padding: 6px 14px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #1a1a1a;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.btn-group button:hover, .generate-btn:hover, .download-btn:hover {
  background: #2a2a2a;
  border-color: #555;
}

.btn-group button.danger {
  border-color: #663333;
}

.btn-group button.danger:hover {
  background: #331a1a;
  border-color: #994444;
}

canvas {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #333;
  cursor: crosshair;
  touch-action: none;
}

.mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.mode-toggle button {
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #1a1a1a;
  color: #999;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.mode-toggle button.active {
  background: #2a3a5c;
  border-color: #4d96ff;
  color: #fff;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #1a1a1a;
  color: #e0e0e0;
  font-size: 13px;
  resize: none;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #4d96ff;
}

.generate-btn {
  width: 100%;
  padding: 12px !important;
  font-size: 15px !important;
  font-weight: 600;
  background: linear-gradient(135deg, #4d96ff, #6bcb77) !important;
  border: none !important;
  color: #fff !important;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  font-size: 13px;
  color: #888;
  text-align: center;
}

.result-area {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid #333;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
}

.result-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  color: #555;
  font-size: 14px;
}

.download-btn {
  width: 100%;
  text-align: center;
}

.debug {
  margin-top: 8px;
  font-size: 12px;
}

.debug summary {
  color: #666;
  cursor: pointer;
  padding: 4px 0;
}

.debug-entry {
  padding: 4px 0;
  border-bottom: 1px solid #222;
}

.debug-entry .time {
  color: #555;
  margin-right: 6px;
}

.debug-entry .step {
  color: #4d96ff;
}

.debug-entry pre {
  margin-top: 2px;
  font-size: 11px;
  color: #777;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 100px;
  overflow: auto;
}

@media (max-width: 900px) {
  main {
    flex-direction: column;
    align-items: center;
  }
  .center {
    width: 100%;
    max-width: 512px;
  }
  .mode-toggle {
    flex-direction: row;
  }
}
</style>
