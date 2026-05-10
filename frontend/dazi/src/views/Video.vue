<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5">Plans</p>
        <h1 class="font-serif text-2xl text-white font-bold">搭配方案</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <div class="flex gap-5 px-4 pt-4 pb-6 max-w-7xl mx-auto h-[calc(100vh-180px)] overflow-hidden">
      <!-- Left: Plan List -->
      <div class="flex-1 min-w-0 overflow-y-auto space-y-3 pr-1">
        <div class="flex items-center gap-3 mb-3">
          <h2 class="font-serif text-base text-ink font-bold">全部方案</h2>
          <div class="flex-1 h-px bg-cream-dark"></div>
          <span class="text-[10px] text-ink-faint tracking-wider uppercase">{{ planList.length }} Plans</span>
        </div>

        <div v-if="planList.length">
          <div v-for="(plan, i) in planList" :key="i"
            class="bg-paper rounded-xl overflow-hidden border border-cream-dark mb-3 group">
            <div class="flex items-start gap-3 p-3">
              <div class="flex gap-1.5 shrink-0">
                <div v-for="item in plan.items.slice(0, 4)" :key="item.name"
                  class="w-14 h-14 rounded-lg overflow-hidden bg-cream ring-1 ring-cream-dark">
                  <img :src="item.oss_url" class="w-full h-full object-cover scale-110" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[11px] font-medium text-ink truncate">{{ plan.label }}</span>
                  <span v-if="plan.source === 'preset'" class="text-[9px] px-1.5 py-0.5 rounded bg-sage/10 text-sage shrink-0">预制</span>
                  <span v-else-if="plan.source === 'home'" class="text-[9px] px-1.5 py-0.5 rounded bg-coral/10 text-coral shrink-0">推荐</span>
                  <span v-else class="text-[9px] px-1.5 py-0.5 rounded bg-warm/10 text-warm shrink-0">视频</span>
                </div>
                <p class="text-[11px] text-ink-faint leading-relaxed line-clamp-2 mb-2">{{ plan.reason }}</p>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1 bg-cream-dark rounded-full overflow-hidden">
                    <div class="h-full rounded-full"
                      :class="plan.score >= 80 ? 'bg-sage' : plan.score >= 60 ? 'bg-warm' : 'bg-coral'"
                      :style="{ width: plan.score + '%' }"></div>
                  </div>
                  <span class="text-[10px] font-bold text-ink-faint w-6 text-right">{{ plan.score }}</span>
                  <button @click="onDelete(i)"
                    class="text-[10px] px-2.5 py-1.5 rounded-lg font-medium bg-cream text-ink-light hover:bg-coral/10 hover:text-coral transition-all active:scale-95 shrink-0 opacity-0 group-hover:opacity-100">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-16 text-ink-faint">
          <p class="font-serif text-lg text-ink-light mb-1">暂无方案</p>
          <p class="text-xs">从右侧导入视频或保存首页推荐</p>
        </div>
      </div>

      <!-- Right: Video Import Panel -->
      <div class="w-80 shrink-0 overflow-y-auto">
        <div class="bg-paper rounded-2xl border border-cream-dark p-5 space-y-5 sticky top-0">
          <!-- Video import -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1.5 h-4 bg-coral rounded-full"></div>
              <h3 class="text-sm font-semibold text-ink">视频导入</h3>
            </div>
            <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-2 block">视频链接</label>
            <input v-model="videoUrl" placeholder="粘贴抖音/B站链接..."
              class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30 mb-3" />
            <button @click="onParse" :disabled="!videoUrl || parsing"
              class="w-full py-3 rounded-xl text-sm font-medium text-white bg-charcoal disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2">
              <svg v-if="parsing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <span>{{ parsing ? '解析中...' : '开始解析' }}</span>
            </button>

            <!-- Parsing progress -->
            <div v-if="parsing" class="mt-3 space-y-2">
              <div v-for="step in parseSteps" :key="step.name" class="flex items-center gap-2">
                <div v-if="step.status === 'done'" class="w-4 h-4 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
                  <svg class="w-2.5 h-2.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div v-else-if="step.status === 'processing'" class="w-4 h-4 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                  <div class="w-2 h-2 rounded-full bg-coral animate-pulse"></div>
                </div>
                <div v-else class="w-4 h-4 rounded-full bg-cream-dark shrink-0"></div>
                <span class="text-[11px]" :class="step.status === 'done' ? 'text-sage' : step.status === 'processing' ? 'text-ink' : 'text-ink-faint/50'">{{ step.label }}</span>
              </div>
            </div>

            <!-- Error message -->
            <p v-if="parseError" class="text-[11px] text-coral mt-2">{{ parseError }}</p>
          </div>

          <!-- Parse result: known video source -->
          <div v-if="parseResult" class="border-t border-cream-dark/50 pt-4 space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-4 bg-sage rounded-full"></div>
              <span class="text-[10px] tracking-[0.15em] uppercase text-ink-faint font-medium">解析结果</span>
              <span class="text-[9px] bg-sage/10 text-sage px-1.5 py-0.5 rounded ml-auto">{{ parseResult.platform === 'douyin' ? '抖音' : 'B站' }}</span>
            </div>

            <p class="text-xs font-medium text-ink leading-relaxed">{{ parseResult.title }}</p>
            <p class="text-[10px] text-ink-faint">{{ parseResult.outfits.length }} 套搭配</p>

            <!-- Outfit cards -->
            <div v-for="(plan, pi) in parseResult.outfits" :key="pi"
              class="bg-cream rounded-xl overflow-hidden border border-cream-dark">
              <div class="flex gap-2 p-2.5">
                <div class="flex gap-1 shrink-0">
                  <div v-for="item in plan.items.slice(0, 4)" :key="item.name"
                    class="w-12 h-12 rounded-lg overflow-hidden bg-white ring-1 ring-cream-dark">
                    <img :src="item.oss_url" class="w-full h-full object-cover scale-110" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-medium text-ink line-clamp-1">{{ plan.label }}</span>
                  <p class="text-[9px] text-ink-faint leading-relaxed mt-0.5 line-clamp-2">{{ plan.reason }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 h-0.5 bg-white rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-sage" :style="{ width: plan.score + '%' }"></div>
                    </div>
                    <span class="text-[9px] font-bold text-ink-faint">{{ plan.score }}</span>
                  </div>
                </div>
              </div>
              <button @click="onSavePlan(plan)" :disabled="savedPlans.has(plan.label)"
                class="w-full py-2 text-[10px] font-medium transition-all active:scale-[0.98]"
                :class="savedPlans.has(plan.label) ? 'bg-sage/10 text-sage' : 'bg-white/50 text-ink-light hover:bg-sage/10 hover:text-sage'">
                {{ savedPlans.has(plan.label) ? '已保存 ✓' : '保存到方案' }}
              </button>
            </div>
          </div>

          <!-- No result empty -->
          <div v-if="!parseResult && !parsing && !parseError" class="border-t border-cream-dark/50 pt-4">
            <div class="flex flex-col items-center justify-center py-8 text-ink-faint">
              <div class="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-lg mb-2"> </div>
              <p class="text-[10px]">粘贴链接后点击解析</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import UserAvatar from '../components/UserAvatar.vue'
import { planList, addPlan, removePlan } from '../stores/planList'
import { findVideoSource, detectPlatform } from '../stores/videoData'
import type { PlanItem } from '../stores/planList'

const videoUrl = ref('')
const parsing = ref(false)
const parseError = ref('')
const parseResult = ref<{ platform: string; title: string; outfits: PlanItem[] } | null>(null)
const savedPlans = reactive(new Map<string, boolean>())

interface ParseStep { name: string; label: string; status: 'pending' | 'processing' | 'done' | 'error' }
const parseSteps = ref<ParseStep[]>([])

function onDelete(i: number) {
  removePlan(i)
}

function onSavePlan(plan: PlanItem) {
  if (savedPlans.has(plan.label)) return
  savedPlans.set(plan.label, true)
  addPlan({ ...plan, source: 'video' })
}

async function onParse() {
  const url = videoUrl.value.trim()
  if (!url) return

  parsing.value = true
  parseError.value = ''
  parseResult.value = null

  // 1. Check known video sources
  const known = findVideoSource(url)
  if (known) {
    // Simulate quick parsing progress for known videos
    parseSteps.value = [
      { name: 'match', label: '匹配已知视频', status: 'processing' },
      { name: 'outfits', label: '提取搭配方案', status: 'pending' },
    ]
    await sleep(600)
    parseSteps.value[0].status = 'done'
    parseSteps.value[1].status = 'processing'
    await sleep(500)
    parseSteps.value[1].status = 'done'

    parseResult.value = {
      platform: known.platform,
      title: known.title,
      outfits: known.outfits,
    }
    parsing.value = false
    return
  }

  // 2. Unknown URL — detect platform
  const platform = detectPlatform(url)

  if (platform === 'douyin') {
    // Douyin: show failure
    parseSteps.value = [
      { name: 'meta', label: '获取视频信息', status: 'processing' },
      { name: 'download', label: '下载视频', status: 'pending' },
    ]
    await sleep(800)
    parseSteps.value[0].status = 'done'
    parseSteps.value[1].status = 'processing'
    await sleep(1200)
    parseSteps.value[1].status = 'error'
    parseError.value = '爬取失败：抖音视频需要登录验证，暂时无法解析'
    parsing.value = false
    return
  }

  if (platform === 'bilibili') {
    // Bilibili: simulate download + cache
    parseSteps.value = [
      { name: 'meta', label: '获取视频信息', status: 'processing' },
      { name: 'download', label: '下载视频', status: 'pending' },
      { name: 'frames', label: '提取关键帧', status: 'pending' },
      { name: 'recognize', label: 'AI 识别衣物', status: 'pending' },
    ]
    await sleep(500)
    parseSteps.value[0].status = 'done'
    parseSteps.value[1].status = 'processing'
    await sleep(1500)
    parseSteps.value[1].status = 'done'
    parseSteps.value[2].status = 'processing'
    await sleep(1000)
    parseSteps.value[2].status = 'done'
    parseSteps.value[3].status = 'processing'
    await sleep(2000)

    // Generate mock bilibili result
    parseSteps.value[3].status = 'done'
    parseResult.value = {
      platform: 'bilibili',
      title: 'B站视频解析结果',
      outfits: [
        {
          label: '识别搭配 1',
          reason: '从视频帧中识别的穿搭组合，风格休闲日常',
          score: 83,
          source: 'video',
          items: [
            { name: '白色撞色猫爪印花短袖 T 恤', role: 'TOP', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
            { name: '黑灰色扎染阔腿牛仔裤', role: 'BOTTOM', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
            { name: 'JEEP SPIRIT吉普老爹鞋', role: 'SHOES', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
          ],
        },
        {
          label: '识别搭配 2',
          reason: '从视频帧中识别的穿搭组合，简约不失亮点',
          score: 79,
          source: 'video',
          items: [
            { name: '浅灰色三条杠拼接圆领短袖T恤', role: 'TOP', oss_url: '/images/8e39687a-5606-4aea-93fa-7bfbb0a68c28.jpg' },
            { name: '黑色不规则开叉A字半身裙', role: 'BOTTOM', oss_url: '/images/f0f2faa2-1765-4d99-8d09-30eb32e9fbb3.jpg' },
            { name: '匡威1970s黑色低帮帆布鞋', role: 'SHOES', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
            { name: '黑色猫咪印花帆布托特包', role: 'BAG', oss_url: '/images/585c072a-08bd-4c77-9db8-1256b9c3e5ac.jpg' },
          ],
        },
      ],
    }
    parsing.value = false
    return
  }

  // Unknown platform
  parseError.value = '无法识别该链接，请粘贴抖音或B站视频链接'
  parsing.value = false
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
</script>
