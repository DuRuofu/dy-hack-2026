<template>
  <div class="min-h-screen bg-cream">
    <!-- Hero -->
    <div class="relative overflow-hidden bg-charcoal grain">
      <div class="relative z-10 px-6 pt-5 pb-6">
        <div class="flex items-center justify-between mb-4">
          <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium">AI Stylist</p>
          <div class="flex items-center gap-2.5">
            <span class="text-white/50 text-[11px]">Hi, Xiao Ming</span>
            <div class="w-8 h-8 rounded-full bg-cream/15 flex items-center justify-center text-white text-xs font-medium ring-1 ring-white/10">明</div>
          </div>
        </div>
        <h1 class="font-serif text-3xl text-white font-bold leading-tight">
          搭<span class="text-coral">子</span>
        </h1>
        <p class="text-white/50 text-[13px] mt-1.5 leading-relaxed max-w-[260px]">
          你的私人穿搭顾问 · 每天为你搭配最优方案
        </p>
      </div>
      <div class="absolute -right-10 top-6 w-40 h-40 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-12 w-28 h-28 rounded-full border border-white/5"></div>
    </div>

    <div class="px-4 pt-5 pb-6 relative z-10">
      <!-- Scene Selection -->
      <div class="bg-paper rounded-2xl shadow-sm p-5 mb-4 border border-cream-dark">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center text-coral text-sm"> </div>
          <div>
            <h2 class="text-sm font-semibold text-ink">今天什么场合？</h2>
            <p class="text-[10px] text-ink-faint">选择场景，AI 为你搭配</p>
          </div>
        </div>

        <div v-if="loadingScenes" class="flex justify-center py-8">
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="s in scenes"
            :key="s.id"
            @click="selectedScene = s.name"
            class="group relative px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-300"
            :class="selectedScene === s.name
              ? 'bg-charcoal text-white shadow-lg shadow-charcoal/20'
              : 'bg-cream text-ink-light hover:bg-cream-dark'"
          >
            <span class="mr-1">{{ s.icon }}</span>
            {{ s.name }}
          </button>
        </div>
      </div>

      <!-- CTA -->
      <button
        v-if="selectedScene"
        @click="onRecommend"
        :disabled="recommending"
        class="w-full py-4 rounded-2xl font-medium text-sm tracking-wide text-white transition-all duration-300 active:scale-[0.97] disabled:opacity-50 bg-charcoal hover:bg-ink shadow-xl shadow-charcoal/20 flex items-center justify-center gap-2"
      >
        <span v-if="recommending" class="flex items-center gap-2">
          <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          正在搭配...
        </span>
        <span v-else>开始搭配 · {{ selectedScene }}</span>
      </button>

      <!-- Results -->
      <div v-if="outfits.length" class="mt-6 space-y-4">
        <div class="flex items-center gap-3">
          <h2 class="font-serif text-xl text-ink font-bold">推荐方案</h2>
          <div class="flex-1 h-px bg-cream-dark"></div>
          <span class="text-[10px] text-ink-faint tracking-wider uppercase">{{ outfits.length }} Plans</span>
        </div>

        <div
          v-for="(plan, i) in outfits"
          :key="i"
          class="bg-paper rounded-2xl overflow-hidden border border-cream-dark group"
        >
          <!-- Score strip -->
          <div class="relative h-1 bg-cream-dark">
            <div
              class="absolute left-0 top-0 h-full rounded-r-full transition-all duration-700"
              :class="plan.score >= 80 ? 'bg-sage' : plan.score >= 60 ? 'bg-warm' : 'bg-coral'"
              :style="{ width: plan.score + '%' }"
            ></div>
          </div>

          <div class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] text-ink-faint tracking-wider uppercase">Plan {{ ['A','B','C','D','E'][i] }}</span>
                <h3 class="text-sm font-semibold text-ink mt-0.5">{{ plan.reason }}</h3>
              </div>
              <div
                class="shrink-0 ml-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                :class="plan.score >= 80 ? 'bg-sage/10 text-sage' : plan.score >= 60 ? 'bg-warm/10 text-warm' : 'bg-coral/10 text-coral'"
              >
                {{ plan.score }}
              </div>
            </div>

            <!-- Items -->
            <div class="flex gap-2.5 overflow-x-auto scroll-snap-x pb-1 -mx-1 px-1">
              <div v-for="item in plan.items" :key="item.clothe_id" class="flex-shrink-0 scroll-snap-start w-24">
                <div class="w-24 h-24 rounded-xl overflow-hidden bg-cream mb-2 ring-1 ring-cream-dark">
                  <img
                    v-if="item.oss_url || item.ossUrl"
                    :src="item.oss_url || item.ossUrl"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-ink-faint/30 text-2xl">
                  </div>
                </div>
                <div class="text-[11px] font-medium text-ink truncate">{{ item.name }}</div>
                <div class="text-[9px] text-ink-faint tracking-wide uppercase">{{ item.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getScenes } from '../api'
import { useOutfitStore } from '../stores/outfit'
import { storeToRefs } from 'pinia'

const scenes = ref<any[]>([])
const loadingScenes = ref(true)
const selectedScene = ref('')
const recommending = ref(false)

const outfitStore = useOutfitStore()
const { outfits } = storeToRefs(outfitStore)

onMounted(async () => {
  try {
    const { data } = await getScenes()
    scenes.value = data.scenes
  } finally {
    loadingScenes.value = false
  }
})

async function onRecommend() {
  recommending.value = true
  try {
    await outfitStore.fetchRecommend(selectedScene.value)
  } finally {
    recommending.value = false
  }
}
</script>
