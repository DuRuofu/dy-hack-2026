<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5">Mix & Match</p>
        <h1 class="font-serif text-2xl text-white font-bold">自由搭配</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
        <p class="text-white/40 text-xs mt-1.5">选出衣物，让 AI 给你打分</p>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <div class="px-4 pt-4 pb-6 space-y-4 relative z-10">
      <!-- Step 1 -->
      <div class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
        <div class="px-5 py-3 border-b border-cream-dark/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="font-serif text-sm font-bold text-coral">01</span>
            <span class="text-xs font-medium text-ink">选择衣物</span>
          </div>
          <button @click="loadWardrobe" class="text-[11px] text-ink-faint tracking-wider uppercase hover:text-ink transition-colors">
            {{ loadingWardrobe ? '加载中' : '刷新' }}
          </button>
        </div>

        <div v-if="wardrobeItems.length" class="p-3 grid grid-cols-4 gap-1.5">
          <div v-for="item in wardrobeItems" :key="item.id"
            @click="toggleSelect(item.id)"
            class="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
            :class="selectedIds.includes(item.id) ? 'ring-2 ring-coral shadow-md scale-[0.97]' : 'ring-1 ring-cream-dark'"
          >
            <img v-if="item.oss_url || item.ossUrl" :src="item.oss_url || item.ossUrl" class="w-full h-full object-cover scale-110" />
            <div v-else class="w-full h-full bg-cream-dark flex items-center justify-center text-ink-faint/30 text-lg"> </div>
            <!-- Selection indicator -->
            <div v-if="selectedIds.includes(item.id)"
              class="absolute inset-0 bg-coral/20 flex items-center justify-center">
              <div class="w-5 h-5 rounded-full bg-coral text-white flex items-center justify-center text-[10px] font-bold">
                {{ selectedIds.indexOf(item.id) + 1 }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center text-xs text-ink-faint">衣橱为空，先去收录衣物</div>
      </div>

      <!-- Step 2: Selected -->
      <div class="bg-paper rounded-2xl border border-cream-dark p-5">
        <div class="flex items-center gap-3 mb-3">
          <span class="font-serif text-sm font-bold text-coral">02</span>
          <span class="text-xs font-medium text-ink">已选 {{ selectedIds.length }} 件</span>
        </div>
        <div v-if="selectedIds.length" class="flex flex-wrap gap-2">
          <div v-for="(id, idx) in selectedIds" :key="id"
            class="group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-cream border border-cream-dark">
            <span class="text-[11px] text-ink">{{ getItemName(id) }}</span>
            <button @click="selectedIds = selectedIds.filter(x => x !== id)"
              class="w-4 h-4 rounded-full bg-cream-dark text-ink-faint flex items-center justify-center text-[10px] group-hover:bg-coral/10 group-hover:text-coral transition-colors">
              ×
            </button>
          </div>
        </div>
        <p v-else class="text-[11px] text-ink-faint">点击上方衣物卡片进行选择</p>
      </div>

      <!-- CTA -->
      <button @click="onEvaluate" :disabled="selectedIds.length === 0 || evaluating"
        class="w-full py-4 rounded-2xl font-medium text-sm tracking-wide text-white bg-charcoal shadow-xl shadow-charcoal/20 disabled:opacity-40 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
        <svg v-if="evaluating" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <span>{{ evaluating ? 'AI 审美分析中...' : '让 AI 点评' }}</span>
      </button>

      <!-- Result -->
      <div v-if="evaluation" class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
        <div class="px-5 py-3 border-b border-cream-dark/50">
          <span class="text-[11px] tracking-[0.15em] uppercase text-ink-faint font-medium">AI 评价</span>
        </div>
        <div class="p-5">
          <!-- Score -->
          <div class="flex items-center gap-5 mb-5">
            <div class="relative w-20 h-20 shrink-0">
              <svg class="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#f0ece6" stroke-width="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  :stroke="scoreColor"
                  stroke-width="2.5"
                  :stroke-dasharray="`${evaluation.score}, 100`"
                  stroke-linecap="round"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-serif text-2xl font-bold" :class="scoreTextColor">{{ evaluation.score }}</span>
                <span class="text-[8px] text-ink-faint tracking-wider uppercase">Score</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="font-serif text-sm font-semibold text-ink mb-1">穿搭评分</p>
              <p class="text-[11px] text-ink-faint leading-relaxed">
                {{ evaluation.score >= 85 ? '出色搭配，很有品味' : evaluation.score >= 70 ? '不错的搭配，稍加调整更佳' : '搭配有待提升，参考建议优化' }}
              </p>
            </div>
          </div>

          <!-- Pros -->
          <div v-if="evaluation.pros?.length" class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center">
                <svg class="w-3 h-3 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span class="text-[10px] tracking-[0.15em] uppercase text-sage font-medium">优点</span>
            </div>
            <ul class="space-y-1.5 pl-1">
              <li v-for="p in evaluation.pros" :key="p" class="text-[13px] text-ink flex items-start gap-2">
                <span class="text-sage mt-1 text-[6px]">●</span>{{ p }}
              </li>
            </ul>
          </div>

          <!-- Cons -->
          <div v-if="evaluation.cons?.length" class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center">
                <svg class="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span class="text-[10px] tracking-[0.15em] uppercase text-coral font-medium">不足</span>
            </div>
            <ul class="space-y-1.5 pl-1">
              <li v-for="c in evaluation.cons" :key="c" class="text-[13px] text-ink flex items-start gap-2">
                <span class="text-coral mt-1 text-[6px]">●</span>{{ c }}
              </li>
            </ul>
          </div>

          <!-- Suggestion -->
          <div v-if="evaluation.suggestion" class="p-4 rounded-xl bg-cream border border-cream-dark">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-warm text-sm"> </span>
              <span class="text-[10px] tracking-[0.15em] uppercase text-warm font-medium">改进建议</span>
            </div>
            <p class="text-[13px] text-ink leading-relaxed">{{ evaluation.suggestion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getWardrobe, evaluateOutfit } from '../api'
import UserAvatar from '../components/UserAvatar.vue'

const wardrobeItems = ref<any[]>([])
const loadingWardrobe = ref(false)
const selectedIds = ref<number[]>([])
const evaluating = ref(false)
const evaluation = ref<any>(null)

const scoreColor = computed(() => {
  if (!evaluation.value) return '#e2e8f0'
  return evaluation.value.score >= 80 ? '#6b9e6b' : evaluation.value.score >= 60 ? '#c4956a' : '#e8654a'
})
const scoreTextColor = computed(() => {
  if (!evaluation.value) return 'text-ink-faint'
  return evaluation.value.score >= 80 ? 'text-success' : evaluation.value.score >= 60 ? 'text-warm' : 'text-coral'
})

onMounted(() => loadWardrobe())

async function loadWardrobe() {
  loadingWardrobe.value = true
  try {
    const { data } = await getWardrobe()
    wardrobeItems.value = data.items
  } finally { loadingWardrobe.value = false }
}

function toggleSelect(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  } else { selectedIds.value.push(id) }
}

function getItemName(id: number) {
  return wardrobeItems.value.find((i) => i.id === id)?.name ?? `#${id}`
}

async function onEvaluate() {
  if (selectedIds.value.length === 0) return
  evaluating.value = true
  evaluation.value = null
  try {
    const { data } = await evaluateOutfit(selectedIds.value)
    evaluation.value = data
  } catch (e: any) {
    alert('评价失败: ' + (e.response?.data?.message || e.message))
  } finally { evaluating.value = false }
}
</script>
