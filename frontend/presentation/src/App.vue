<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Slide {
  type: 'title' | 'overview' | 'pipeline' | 'demo' | 'tech' | 'team' | 'cta'
  [key: string]: any
}

const slides: Slide[] = [
  {
    type: 'title',
    heading: '搭子',
    subheading: '抖音黑客松 · 2026 · 赛道一：视觉搜索',
    tagline: 'AI 穿搭助手，让每一套搭配都有品味',
  },
  {
    type: 'overview',
    heading: '产品概览',
    icon: ' ',
    points: [
      { icon: ' ', text: '抖音穿搭视频 → 自动提取衣物单品，构建灵感衣橱' },
      { icon: ' ', text: '拍照 / 上传衣物图片，AI 智能识别品类、颜色、风格' },
      { icon: ' ', text: '基于场景（通勤/约会/运动）生成穿搭推荐方案' },
      { icon: '✨', text: '自选搭配 + AI 审美评价，给出评分和改进建议' },
    ],
  },
  {
    type: 'pipeline',
    heading: '技术架构',
    steps: [
      { label: '视频下载', icon: ' ', detail: 'yt-dlp 多平台支持', color: '#4ecdc4' },
      { label: '关键帧提取', icon: ' ', detail: 'FFmpeg 智能抽帧', color: '#44a3f1' },
      { label: 'AI 衣物识别', icon: ' ', detail: '多模态识别品类·颜色·风格', color: '#a29bfe' },
      { label: '穿搭推荐', icon: ' ', detail: '基于场景智能搭配', color: '#ff6b6b' },
      { label: '可视化展示', icon: ' ', detail: '搭配方案 + 审美评分', color: '#ffd93d' },
    ],
  },
  {
    type: 'demo',
    heading: '核心功能',
    demos: [
      { name: '衣物识别', desc: '上传图片，AI 识别品类·颜色·风格', emoji: ' ', port: '3000' },
      { name: '衣橱管理', desc: '灵感衣橱 + 个人衣橱双库', emoji: ' ', port: '3000' },
      { name: '穿搭推荐', desc: '选场景，AI 推荐最佳搭配方案', emoji: ' ', port: '3000' },
      { name: '自选搭配', desc: '自由组合衣物，AI 给出审美评分', emoji: ' ', port: '3000' },
      { name: '视频提取', desc: '抖音穿搭视频 → 自动提取衣物', emoji: ' ', port: '3000' },
      { name: '场景选择', desc: '通勤 / 约会 / 运动 / 休闲 / 聚会', emoji: ' ', port: '3000' },
    ],
  },
  {
    type: 'tech',
    heading: '技术亮点',
    stats: [
      { value: '3', label: '衣物来源', suffix: '路' },
      { value: '3', label: 'AI 模型可切换', suffix: '家' },
      { value: '5', label: '穿搭场景', suffix: '个' },
      { value: '6', label: '核心功能', suffix: '项' },
    ],
    highlights: [
      '抖音视频 → 衣物单品自动提取（yt-dlp + FFmpeg + AI 多模态）',
      'AI 多模型切换：阿里百炼 / 火山大模型 / MiniMax 2.7',
      'Vue 3 + NestJS + PostgreSQL 全栈 TypeScript',
      '阿里云 OSS 图片存储，轻量高效',
    ],
  },
  {
    type: 'team',
    heading: '团队成员',
    members: [
      { name: 'DuRuofu', role: '队长 · 全栈开发', avatar: ' ', bio: '统筹技术架构与产品方向', color: '#ff6b6b', accent: '#ff4444' },
      { name: '田', role: 'AI 算法', avatar: ' ', bio: 'Prompt 工程与模型调优', color: '#4ecdc4', accent: '#00d2d3' },
      { name: 'xun', role: '产品设计', avatar: ' ', bio: '产品策划与路演展示', color: '#ffd93d', accent: '#f9ca24' },
      { name: '待填写', role: '辅助开发', avatar: ' ', bio: '协助开发与测试', color: '#a29bfe', accent: '#6c5ce7' },
    ],
  },
  {
    type: 'cta',
    heading: 'Thank You',
    subheading: '搭子 — AI 穿搭助手',
    tagline: 'AI 穿搭助手，让每一套搭配都有品味',
    qrText: '扫码体验 Demo',
  },
]

const current = ref(0)
const direction = ref(1)
const progress = ref(0)
const isFullscreen = ref(false)
const AUTO_INTERVAL = 6000
let timer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

const particleData = Array.from({ length: 80 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 12,
  duration: 3 + Math.random() * 10,
  size: 1 + Math.random() * 3,
  hue: Math.random() * 360,
}))

const gridLines = Array.from({ length: 20 }, (_, i) => i)

// Animated counter for tech slide
const countersVisible = ref(false)
const counterValues = ref([0, 0, 0, 0])

function animateCounters() {
  countersVisible.value = true
  const targets = [3, 3, 5, 6]
  const duration = 1500
  const start = performance.now()
  function tick(now: number) {
    const t = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    counterValues.value = targets.map(v => Math.round(v * ease))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function goTo(index: number) {
  direction.value = index > current.value ? 1 : -1
  current.value = index
  if (slides[index].type === 'tech' && !countersVisible.value) animateCounters()
  resetTimer()
}

function next() {
  direction.value = 1
  current.value = (current.value + 1) % slides.length
  if (slides[current.value].type === 'tech' && !countersVisible.value) animateCounters()
  resetTimer()
}

function prev() {
  direction.value = -1
  current.value = (current.value - 1 + slides.length) % slides.length
  resetTimer()
}

function resetTimer() {
  clearInterval(timer!)
  clearInterval(progressTimer!)
  progress.value = 0
  timer = setInterval(next, AUTO_INTERVAL)
  progressTimer = setInterval(() => {
    progress.value += 100 / (AUTO_INTERVAL / 50)
  }, 50)
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  if (e.key === 'f' || e.key === 'F') toggleFullscreen()
}

let touchStartX = 0
function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e: TouchEvent) {
  const diff = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(diff) > 50) diff < 0 ? next() : prev()
}

onMounted(() => {
  resetTimer()
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  clearInterval(timer!)
  clearInterval(progressTimer!)
  window.removeEventListener('keydown', handleKey)
})

const currentSlide = computed(() => slides[current.value])
</script>

<template>
  <div class="carousel" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <!-- Background layers -->
    <div class="gradient-mesh" />
    <div class="grid-overlay">
      <div v-for="n in gridLines" :key="'h'+n" class="grid-line-h" :style="{ top: n * 5 + '%' }" />
      <div v-for="n in gridLines" :key="'v'+n" class="grid-line-v" :style="{ left: n * 5 + '%' }" />
    </div>
    <div class="particles">
      <div
        v-for="(p, i) in particleData" :key="i" class="particle"
        :style="{
          left: p.left + '%', top: p.top + '%',
          animationDelay: p.delay + 's', animationDuration: p.duration + 's',
          width: p.size + 'px', height: p.size + 'px',
          background: `hsla(${p.hue}, 80%, 65%, 0.6)`,
          boxShadow: `0 0 ${p.size * 3}px hsla(${p.hue}, 80%, 65%, 0.3)`,
        }"
      />
    </div>
    <div class="aurora">
      <div class="aurora-band aurora-1" />
      <div class="aurora-band aurora-2" />
      <div class="aurora-band aurora-3" />
    </div>

    <!-- Slides -->
    <TransitionGroup :name="direction > 0 ? 'slide-forward' : 'slide-backward'">
      <div v-for="(slide, index) in slides" v-show="index === current" :key="index" class="slide">

        <!-- ===== TITLE ===== -->
        <div v-if="slide.type === 'title'" class="slide-content title-slide">
          <div class="hex-rings">
            <svg class="hex-ring hex-1" viewBox="0 0 200 200">
              <polygon points="100,10 180,55 180,145 100,190 20,145 20,55" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            </svg>
            <svg class="hex-ring hex-2" viewBox="0 0 200 200">
              <polygon points="100,10 180,55 180,145 100,190 20,145 20,55" fill="none" stroke="rgba(78,205,196,0.08)" stroke-width="0.5"/>
            </svg>
            <div class="ring ring-1" />
            <div class="ring ring-2" />
            <div class="ring ring-3" />
          </div>
          <div class="title-badge">HACKATHON 2026</div>
          <h1 class="main-title glitch" data-text="搭子">
            <span class="char" v-for="(ch, i) in slide.heading" :key="i"
              :style="{ animationDelay: i * 0.06 + 0.3 + 's' }">{{ ch }}</span>
          </h1>
          <p class="sub-title">
            <span class="sub-char" v-for="(ch, i) in slide.subheading" :key="i"
              :style="{ animationDelay: i * 0.04 + 0.8 + 's' }">{{ ch === ' ' ? ' ' : ch }}</span>
          </p>
          <div class="title-line" />
          <p class="tagline">{{ slide.tagline }}</p>
          <div class="pulse-dots">
            <span class="pulse-dot" />
            <span class="pulse-dot" style="animation-delay: 0.5s" />
            <span class="pulse-dot" style="animation-delay: 1s" />
          </div>
        </div>

        <!-- ===== OVERVIEW ===== -->
        <div v-else-if="slide.type === 'overview'" class="slide-content overview-slide">
          <h2 class="section-title">
            <span class="title-index">01</span>
            {{ slide.heading }}
          </h2>
          <div class="overview-grid">
            <div v-for="(pt, i) in slide.points" :key="i" class="overview-card"
              :style="{ animationDelay: i * 0.12 + 0.3 + 's' }">
              <div class="overview-icon">{{ pt.icon }}</div>
              <p class="overview-text">{{ pt.text }}</p>
              <div class="overview-num">{{ String(i + 1).padStart(2, '0') }}</div>
            </div>
          </div>
        </div>

        <!-- ===== PIPELINE ===== -->
        <div v-else-if="slide.type === 'pipeline'" class="slide-content pipeline-slide">
          <h2 class="section-title">
            <span class="title-index">02</span>
            {{ slide.heading }}
          </h2>
          <div class="pipeline-flow">
            <div v-for="(step, i) in slide.steps" :key="i" class="pipeline-step"
              :style="{ animationDelay: i * 0.15 + 0.3 + 's', '--step-color': step.color }">
              <div class="step-icon-wrap">
                <span class="step-icon">{{ step.icon }}</span>
              </div>
              <div class="step-info">
                <div class="step-label">{{ step.label }}</div>
                <div class="step-detail">{{ step.detail }}</div>
              </div>
              <div v-if="i < slide.steps.length - 1" class="step-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="pipeline-bar">
            <div v-for="(step, i) in slide.steps" :key="i" class="bar-segment"
              :style="{ background: step.color, animationDelay: i * 0.2 + 0.5 + 's' }" />
          </div>
        </div>

        <!-- ===== DEMO ===== -->
        <div v-else-if="slide.type === 'demo'" class="slide-content demo-slide">
          <h2 class="section-title">
            <span class="title-index">03</span>
            {{ slide.heading }}
          </h2>
          <div class="demo-grid">
            <div v-for="(d, i) in slide.demos" :key="i" class="demo-card"
              :style="{ animationDelay: i * 0.08 + 0.3 + 's' }">
              <div class="demo-emoji">{{ d.emoji }}</div>
              <div class="demo-info">
                <div class="demo-name">{{ d.name }}</div>
                <div class="demo-desc">{{ d.desc }}</div>
              </div>
              <div class="demo-port">:{{ d.port }}</div>
            </div>
          </div>
        </div>

        <!-- ===== TECH ===== -->
        <div v-else-if="slide.type === 'tech'" class="slide-content tech-slide">
          <h2 class="section-title">
            <span class="title-index">04</span>
            {{ slide.heading }}
          </h2>
          <div class="stats-row">
            <div v-for="(s, i) in slide.stats" :key="i" class="stat-card"
              :style="{ animationDelay: i * 0.1 + 0.3 + 's' }">
              <div class="stat-value">
                <span class="stat-num">{{ counterValues[i] }}</span>
                <span class="stat-suffix">{{ s.suffix }}</span>
              </div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
          <ul class="highlight-list">
            <li v-for="(h, i) in slide.highlights" :key="i" class="highlight-item"
              :style="{ animationDelay: i * 0.1 + 0.6 + 's' }">
              <span class="highlight-dot" />
              <span>{{ h }}</span>
            </li>
          </ul>
        </div>

        <!-- ===== TEAM ===== -->
        <div v-else-if="slide.type === 'team'" class="slide-content team-slide">
          <h2 class="section-title">
            <span class="title-index">05</span>
            {{ slide.heading }}
          </h2>
          <div class="team-grid">
            <div v-for="(m, i) in slide.members" :key="i" class="team-card"
              :style="{ animationDelay: i * 0.12 + 0.3 + 's', '--accent': m.accent }">
              <div class="team-avatar-ring">
                <div class="team-avatar">{{ m.avatar }}</div>
              </div>
              <div class="team-name" :style="{ color: m.color }">{{ m.name }}</div>
              <div class="team-role">{{ m.role }}</div>
              <div class="team-divider" :style="{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }" />
              <div class="team-bio">{{ m.bio }}</div>
            </div>
          </div>
        </div>

        <!-- ===== CTA ===== -->
        <div v-else-if="slide.type === 'cta'" class="slide-content cta-slide">
          <div class="cta-glow" />
          <h1 class="cta-title">
            <span class="cta-char" v-for="(ch, i) in slide.heading" :key="i"
              :style="{ animationDelay: i * 0.08 + 0.2 + 's' }">{{ ch === ' ' ? ' ' : ch }}</span>
          </h1>
          <p class="cta-sub">{{ slide.subheading }}</p>
          <div class="cta-line" />
          <p class="cta-tagline">{{ slide.tagline }}</p>
          <div class="cta-qr-placeholder">
            <div class="qr-inner">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(78,205,196,0.5)" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                <line x1="20" y1="14" x2="20" y2="20"/><line x1="14" y1="20" x2="20" y2="20"/>
              </svg>
              <span>{{ slide.qrText }}</span>
            </div>
          </div>
          <div class="cta-team">
            <span>DuRuofu</span>
            <span class="cta-dot">·</span>
            <span>抖音黑客松 2026</span>
          </div>
        </div>

      </div>
    </TransitionGroup>

    <!-- Navigation -->
    <div class="nav-dots">
      <button v-for="(slide, i) in slides" :key="i"
        class="nav-dot" :class="{ active: i === current }" @click="goTo(i)">
        <span v-if="i === current" class="dot-progress" :style="{ width: progress + '%' }" />
      </button>
    </div>
    <button class="nav-arrow nav-prev" @click="prev" aria-label="Previous">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button class="nav-arrow nav-next" @click="next" aria-label="Next">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    </button>
    <div class="slide-counter">
      <span class="counter-current">{{ String(current + 1).padStart(2, '0') }}</span>
      <span class="counter-sep">/</span>
      <span class="counter-total">{{ String(slides.length).padStart(2, '0') }}</span>
    </div>
    <Transition name="fs-btn">
      <button v-if="!isFullscreen" class="fullscreen-btn" @click="toggleFullscreen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
        </svg>
        <span>全屏</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.carousel {
  width: 100vw; height: 100vh; overflow: hidden; position: relative;
  background: #050510; user-select: none; perspective: 1200px;
}

/* ===== BG Effects ===== */
.gradient-mesh {
  position: fixed; inset: -50%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(78, 40, 120, 0.18) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(40, 80, 140, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(120, 40, 80, 0.12) 0%, transparent 50%);
  animation: meshDrift 20s ease-in-out infinite alternate; z-index: 0;
}
@keyframes meshDrift {
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-5%, 3%) rotate(2deg); }
  66% { transform: translate(3%, -2%) rotate(-1deg); }
  100% { transform: translate(-2%, 5%) rotate(3deg); }
}
.grid-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.03; }
.grid-line-h, .grid-line-v { position: absolute; background: rgba(255,255,255,0.5); }
.grid-line-h { left: 0; width: 100%; height: 1px; }
.grid-line-v { top: 0; height: 100%; width: 1px; }
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 2; }
.particle {
  position: absolute; border-radius: 50%;
  animation: particleFloat linear infinite;
}
@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10% { opacity: 1; transform: scale(1); }
  50% { transform: translateY(-80px) translateX(20px) scale(1.2); }
  90% { opacity: 0.6; }
  100% { transform: translateY(-160px) translateX(-10px) scale(0.5); opacity: 0; }
}
.aurora { position: fixed; top: -30%; left: -10%; right: -10%; height: 60%; pointer-events: none; z-index: 1; filter: blur(60px); }
.aurora-band { position: absolute; width: 120%; height: 100px; border-radius: 50%; opacity: 0.06; }
.aurora-1 { top: 20%; left: -10%; background: linear-gradient(90deg, #4ecdc4, #44a3f1, #a29bfe); animation: am1 12s ease-in-out infinite alternate; }
.aurora-2 { top: 40%; left: -5%; background: linear-gradient(90deg, #ff6b6b, #ffd93d, #4ecdc4); animation: am2 15s ease-in-out infinite alternate; }
.aurora-3 { top: 55%; left: 0; background: linear-gradient(90deg, #a29bfe, #ff6b6b, #44a3f1); animation: am3 18s ease-in-out infinite alternate; }
@keyframes am1 { from { transform: translateX(-10%) rotate(-3deg); } to { transform: translateX(5%) rotate(2deg); } }
@keyframes am2 { from { transform: translateX(5%) rotate(2deg); } to { transform: translateX(-8%) rotate(-2deg); } }
@keyframes am3 { from { transform: translateX(-3%) rotate(1deg); } to { transform: translateX(10%) rotate(-3deg); } }

/* ===== Slide Base ===== */
.slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 5; }
.slide-content { width: 100%; max-width: 1200px; padding: 40px; position: relative; }
.slide-forward-enter-active, .slide-forward-leave-active,
.slide-backward-enter-active, .slide-backward-leave-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-forward-enter-from { transform: translateX(80px) rotateY(-5deg); opacity: 0; filter: blur(8px); }
.slide-forward-leave-to { transform: translateX(-80px) rotateY(5deg); opacity: 0; filter: blur(8px); }
.slide-backward-enter-from { transform: translateX(-80px) rotateY(5deg); opacity: 0; filter: blur(8px); }
.slide-backward-leave-to { transform: translateX(80px) rotateY(-5deg); opacity: 0; filter: blur(8px); }

/* ===== TITLE ===== */
.title-slide { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.title-badge {
  font-size: 11px; letter-spacing: 6px; color: rgba(78,205,196,0.7);
  border: 1px solid rgba(78,205,196,0.2); padding: 6px 20px; border-radius: 20px;
  margin-bottom: 40px; animation: fadeIn 0.8s ease 0.1s both; text-transform: uppercase;
}
.hex-rings { position: absolute; width: 500px; height: 500px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.hex-ring { position: absolute; width: 350px; height: 350px; animation: spin 30s linear infinite; }
.hex-2 { width: 450px; height: 450px; animation-direction: reverse; animation-duration: 45s; }
.ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.04); animation: spin 25s linear infinite; }
.ring-1 { width: 280px; height: 280px; }
.ring-2 { width: 380px; height: 380px; animation-direction: reverse; animation-duration: 35s; }
.ring-3 { width: 480px; height: 480px; animation-duration: 50s; border-style: dashed; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.main-title {
  font-size: 96px; font-weight: 900; letter-spacing: 10px; margin-bottom: 20px;
  background: linear-gradient(135deg, #fff 0%, #a8c0ff 40%, #4ecdc4 70%, #fff 100%);
  background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: gradientShift 4s ease infinite, titleIn 1s ease 0.2s both; position: relative;
}
@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes titleIn { from { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(10px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
.glitch::before, .glitch::after {
  content: attr(data-text); position: absolute; left: 0; top: 0; width: 100%;
  background: transparent; -webkit-background-clip: text; -webkit-text-fill-color: transparent; pointer-events: none;
}
.glitch::before { background: linear-gradient(90deg, #ff006e, #00f5d4); -webkit-background-clip: text; animation: glitch1 8s infinite; opacity: 0; }
.glitch::after { background: linear-gradient(90deg, #00f5d4, #8338ec); -webkit-background-clip: text; animation: glitch2 8s infinite; opacity: 0; }
@keyframes glitch1 { 0%,92%,100%{opacity:0;transform:none} 93%{opacity:.3;transform:translateX(-3px) skewX(-2deg)} 94%{opacity:0} 96%{opacity:.2;transform:translateX(2px) skewX(1deg)} 97%{opacity:0} }
@keyframes glitch2 { 0%,94%,100%{opacity:0;transform:none} 95%{opacity:.2;transform:translateX(3px) skewX(2deg)} 96%{opacity:0} 98%{opacity:.15;transform:translateX(-2px)} 99%{opacity:0} }
.char { display: inline-block; animation: charReveal 0.5s ease both; }
@keyframes charReveal { from { opacity:0; transform:translateY(25px) scale(0.7); filter:blur(6px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
.sub-title { font-size: 32px; color: rgba(255,255,255,0.5); letter-spacing: 12px; margin-bottom: 28px; }
.sub-char { display: inline-block; animation: fadeIn 0.3s ease both; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.title-line { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, rgba(78,205,196,0.6), transparent); margin-bottom: 20px; animation: fadeIn 0.6s ease 1.2s both; }
.tagline { font-size: 26px; color: rgba(255,255,255,0.35); max-width: 700px; line-height: 1.7; animation: fadeIn 0.6s ease 1.4s both; }
.pulse-dots { margin-top: 48px; display: flex; gap: 8px; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(78,205,196,0.6); animation: pulse 2.5s ease infinite; }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(78,205,196,0.3);transform:scale(1)} 50%{box-shadow:0 0 0 12px rgba(78,205,196,0);transform:scale(1.3)} }

/* ===== Shared Section Title ===== */
.section-title { font-size: 48px; font-weight: 700; margin-bottom: 40px; color: #fff; display: flex; align-items: baseline; gap: 12px; }
.title-index { font-size: 14px; font-weight: 400; color: rgba(78,205,196,0.5); font-variant-numeric: tabular-nums; }

/* ===== OVERVIEW ===== */
.overview-slide { display: flex; flex-direction: column; }
.overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.overview-card {
  padding: 28px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02); position: relative; overflow: hidden;
  animation: fadeSlideUp 0.6s ease both; transition: all 0.3s;
}
.overview-card:hover { border-color: rgba(78,205,196,0.2); background: rgba(78,205,196,0.03); transform: translateY(-2px); }
@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
.overview-icon { font-size: 36px; margin-bottom: 14px; }
.overview-text { font-size: 20px; color: rgba(255,255,255,0.75); line-height: 1.6; }
.overview-num { position: absolute; top: 16px; right: 20px; font-size: 48px; font-weight: 900; color: rgba(255,255,255,0.03); font-variant-numeric: tabular-nums; }

/* ===== PIPELINE ===== */
.pipeline-slide { display: flex; flex-direction: column; }
.pipeline-flow { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; margin-bottom: 40px; }
.pipeline-step {
  display: flex; align-items: center; gap: 0; animation: fadeSlideUp 0.5s ease both;
}
.step-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--step-color); background: rgba(255,255,255,0.02);
  box-shadow: 0 0 20px color-mix(in srgb, var(--step-color) 15%, transparent);
  transition: all 0.3s; position: relative;
}
.step-icon-wrap:hover { box-shadow: 0 0 40px color-mix(in srgb, var(--step-color) 30%, transparent); transform: scale(1.08); }
.step-icon { font-size: 28px; }
.step-info { padding: 0 16px; }
.step-label { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.step-detail { font-size: 12px; color: rgba(255,255,255,0.4); }
.step-arrow { color: rgba(255,255,255,0.15); padding: 0 8px; }
.pipeline-bar { display: flex; gap: 4px; height: 4px; border-radius: 2px; overflow: hidden; }
.bar-segment { flex: 1; border-radius: 2px; animation: barGrow 0.6s ease both; transform-origin: left; }
@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* ===== DEMO ===== */
.demo-slide { display: flex; flex-direction: column; }
.demo-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.demo-card {
  padding: 24px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02); animation: fadeSlideUp 0.5s ease both;
  transition: all 0.3s; display: flex; flex-direction: column; gap: 12px;
}
.demo-card:hover { border-color: rgba(78,205,196,0.2); background: rgba(78,205,196,0.03); transform: translateY(-3px); }
.demo-emoji { font-size: 32px; }
.demo-name { font-size: 18px; font-weight: 600; color: #fff; }
.demo-desc { font-size: 13px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.demo-port {
  font-size: 11px; color: rgba(78,205,196,0.5); font-family: 'SF Mono', 'Fira Code', monospace;
  background: rgba(78,205,196,0.06); padding: 2px 8px; border-radius: 4px; align-self: flex-start;
}

/* ===== TECH ===== */
.tech-slide { display: flex; flex-direction: column; }
.stats-row { display: flex; gap: 24px; margin-bottom: 40px; }
.stat-card {
  flex: 1; text-align: center; padding: 28px 16px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
  animation: fadeSlideUp 0.5s ease both; transition: all 0.3s;
}
.stat-card:hover { border-color: rgba(78,205,196,0.2); }
.stat-value { font-size: 48px; font-weight: 800; color: #4ecdc4; margin-bottom: 8px; }
.stat-num { font-variant-numeric: tabular-nums; }
.stat-suffix { font-size: 20px; font-weight: 400; color: rgba(78,205,196,0.5); margin-left: 2px; }
.stat-label { font-size: 14px; color: rgba(255,255,255,0.5); }
.highlight-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.highlight-item {
  font-size: 20px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 14px;
  animation: fadeSlideUp 0.5s ease both; padding: 12px 16px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); transition: all 0.3s;
}
.highlight-item:hover { border-color: rgba(78,205,196,0.12); background: rgba(78,205,196,0.02); }
.highlight-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ecdc4; flex-shrink: 0; }

/* ===== TEAM ===== */
.team-slide { display: flex; flex-direction: column; }
.team-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; }
.team-card {
  text-align: center; padding: 32px 20px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
  animation: fadeSlideUp 0.6s ease both; transition: all 0.3s;
}
.team-card:hover { border-color: color-mix(in srgb, var(--accent) 30%, transparent); transform: translateY(-4px); }
.team-avatar-ring {
  width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px;
  border: 2px solid var(--accent); padding: 3px; position: relative;
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 15%, transparent);
  animation: ringPulse 3s ease infinite;
}
@keyframes ringPulse { 0%,100%{box-shadow:0 0 16px color-mix(in srgb, var(--accent) 10%, transparent)} 50%{box-shadow:0 0 36px color-mix(in srgb, var(--accent) 25%, transparent)} }
.team-avatar {
  width: 100%; height: 100%; border-radius: 50%; background: rgba(255,255,255,0.03);
  display: flex; align-items: center; justify-content: center; font-size: 36px;
}
.team-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.team-role { font-size: 13px; color: rgba(255,255,255,0.4); letter-spacing: 2px; margin-bottom: 14px; }
.team-divider { width: 50px; height: 1px; margin: 0 auto 14px; }
.team-bio { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }

/* ===== CTA ===== */
.cta-slide { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.cta-glow {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%);
  animation: ctaGlow 4s ease-in-out infinite alternate; pointer-events: none;
}
@keyframes ctaGlow { from { transform: scale(0.8); opacity: 0.5; } to { transform: scale(1.2); opacity: 1; } }
.cta-title {
  font-size: 80px; font-weight: 900; letter-spacing: 8px; margin-bottom: 16px;
  background: linear-gradient(135deg, #fff, #4ecdc4, #a29bfe, #fff);
  background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: gradientShift 5s ease infinite;
}
.cta-char { display: inline-block; animation: charReveal 0.5s ease both; }
.cta-sub { font-size: 24px; color: rgba(255,255,255,0.5); letter-spacing: 6px; margin-bottom: 24px; animation: fadeIn 0.6s ease 0.8s both; }
.cta-line { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, rgba(78,205,196,0.6), transparent); margin-bottom: 20px; animation: fadeIn 0.6s ease 1s both; }
.cta-tagline { font-size: 22px; color: rgba(255,255,255,0.3); margin-bottom: 48px; animation: fadeIn 0.6s ease 1.2s both; }
.cta-qr-placeholder {
  animation: fadeIn 0.6s ease 1.4s both; margin-bottom: 40px;
}
.qr-inner {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 24px 40px; border: 1px solid rgba(78,205,196,0.15); border-radius: 16px;
  background: rgba(78,205,196,0.03);
}
.qr-inner span { font-size: 13px; color: rgba(78,205,196,0.5); letter-spacing: 2px; }
.cta-team {
  font-size: 14px; color: rgba(255,255,255,0.25); display: flex; gap: 8px;
  animation: fadeIn 0.6s ease 1.6s both;
}
.cta-dot { color: rgba(78,205,196,0.4); }

/* ===== Navigation ===== */
.nav-dots { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 20; }
.nav-dot {
  width: 32px; height: 3px; border-radius: 2px; border: none; background: rgba(255,255,255,0.12);
  cursor: pointer; position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); padding: 0;
}
.nav-dot.active { width: 52px; background: rgba(255,255,255,0.08); }
.nav-dot:hover { background: rgba(255,255,255,0.2); }
.dot-progress { position: absolute; left: 0; top: 0; height: 100%; background: linear-gradient(90deg, #4ecdc4, #44a3f1); border-radius: 2px; transition: width 0.05s linear; }
.nav-arrow {
  position: fixed; top: 50%; transform: translateY(-50%); width: 44px; height: 44px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.3); cursor: pointer; z-index: 20; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px);
}
.nav-arrow:hover { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.2); transform: translateY(-50%) scale(1.1); }
.nav-prev { left: 20px; }
.nav-next { right: 20px; }
.slide-counter { position: fixed; bottom: 32px; right: 28px; z-index: 20; font-variant-numeric: tabular-nums; }
.counter-current { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.5); }
.counter-sep { font-size: 12px; color: rgba(255,255,255,0.15); margin: 0 2px; }
.counter-total { font-size: 13px; color: rgba(255,255,255,0.2); }
.fullscreen-btn {
  position: fixed; bottom: 28px; right: 80px; z-index: 20;
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5);
  font-size: 13px; cursor: pointer; backdrop-filter: blur(12px); transition: all 0.3s; letter-spacing: 1px;
}
.fullscreen-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(78,205,196,0.3); }
.fs-btn-leave-active { transition: all 0.5s ease; }
.fs-btn-leave-to { opacity: 0; transform: scale(0.8) translateY(10px); }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .main-title { font-size: 42px; letter-spacing: 2px; }
  .sub-title { font-size: 18px; letter-spacing: 3px; }
  .tagline { font-size: 16px; padding: 0 20px; }
  .section-title { font-size: 28px; }
  .overview-grid { grid-template-columns: 1fr; }
  .demo-grid { grid-template-columns: 1fr 1fr; }
  .stats-row { flex-wrap: wrap; }
  .stat-card { flex: 0 0 45%; }
  .pipeline-flow { flex-direction: column; gap: 12px; }
  .step-arrow { transform: rotate(90deg); }
  .slide-content { padding: 24px; }
  .hex-rings { width: 300px; height: 300px; }
  .hex-ring { width: 220px; height: 220px; }
  .hex-2 { width: 280px; height: 280px; }
  .cta-title { font-size: 40px; letter-spacing: 2px; }
  .highlight-item { font-size: 16px; }
  .stat-value { font-size: 36px; }
  .team-grid { grid-template-columns: 1fr 1fr; }
}
</style>
