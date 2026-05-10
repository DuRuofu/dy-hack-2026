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
          <p class="text-xs">从右侧导入或保存首页推荐</p>
        </div>
      </div>

      <!-- Right: Import Panel -->
      <div class="w-72 shrink-0">
        <div class="bg-paper rounded-2xl border border-cream-dark p-5 sticky top-0 space-y-5">
          <!-- Video import -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1.5 h-4 bg-coral rounded-full"></div>
              <h3 class="text-sm font-semibold text-ink">视频导入</h3>
            </div>
            <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-2 block">视频链接</label>
            <input v-model="videoUrl" placeholder="粘贴抖音链接..."
              class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30 mb-3" />
            <button @click="onParse" :disabled="!videoUrl || parsing"
              class="w-full py-3 rounded-xl text-sm font-medium text-white bg-charcoal disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2">
              <svg v-if="parsing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <span>{{ parsing ? '解析中...' : '开始解析' }}</span>
            </button>
            <p v-if="parsing" class="text-[11px] text-ink-faint mt-2">下载视频、提取关键帧、AI 识别中...</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserAvatar from '../components/UserAvatar.vue'
import { planList, addPlan, removePlan } from '../stores/planList'

const videoUrl = ref('')
const parsing = ref(false)

function onDelete(i: number) {
  removePlan(i)
}

async function onParse() {
  if (!videoUrl.value) return
  parsing.value = true
  try {
    await new Promise(r => setTimeout(r, 2500))
    addPlan({
      label: '视频灵感搭配',
      reason: '从视频中提取的穿搭灵感：休闲白T搭配阔腿牛仔裤，老爹鞋潮流舒适',
      score: 84,
      source: 'video',
      items: [
        { name: '白色撞色猫爪印花短袖 T 恤', role: 'TOP', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
        { name: '黑灰色扎染阔腿牛仔裤', role: 'BOTTOM', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
        { name: 'JEEP SPIRIT吉普老爹鞋', role: 'SHOES', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
        { name: '史迪奇印花帆布托特包', role: 'BAG', oss_url: '/images/52c14f81-8e44-46b1-8926-bde5fb677371.jpg' },
      ],
    })
  } finally {
    parsing.value = false
  }
}
</script>
