<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 pt-5 pb-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium">Video Parse</p>
          <div class="flex items-center gap-2.5">
            <span class="text-white/50 text-[11px]">Hi, Xiao Ming</span>
            <div class="w-7 h-7 rounded-full bg-cream/15 flex items-center justify-center text-white text-[11px] font-medium ring-1 ring-white/10">明</div>
          </div>
        </div>
        <h1 class="font-serif text-2xl text-white font-bold">视频解析</h1>
        <p class="text-white/40 text-xs mt-1.5">从穿搭视频中提取单品</p>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <div class="px-4 pt-4 pb-6 space-y-4 relative z-10">
      <!-- Input -->
      <div class="bg-paper rounded-2xl border border-cream-dark p-5">
        <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-2 block">视频链接</label>
        <div class="flex gap-2">
          <input v-model="videoUrl" placeholder="粘贴抖音链接..."
            class="flex-1 px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30" />
          <button @click="onParse" :disabled="!videoUrl || parsing"
            class="px-5 py-3 rounded-xl text-sm font-medium text-white bg-charcoal shadow-lg shadow-charcoal/20 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0">
            <svg v-if="parsing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span v-else>解析</span>
          </button>
        </div>
        <p v-if="parsing" class="text-[11px] text-ink-faint mt-2 flex items-center gap-1.5">
          <svg class="w-3 h-3 animate-pulse text-warm" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
          下载视频并提取关键帧，约需 30 秒...
        </p>
      </div>

      <!-- Results -->
      <div v-if="parsedItems.length" class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 border-b border-cream-dark/50">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-sage rounded-full"></div>
            <span class="text-[10px] tracking-[0.15em] uppercase text-ink-faint font-medium">识别单品</span>
          </div>
          <span class="text-xs text-ink-faint">{{ checkedCount }} / {{ parsedItems.length }}</span>
        </div>

        <div class="p-3 grid grid-cols-3 gap-2">
          <div v-for="(item, i) in parsedItems" :key="i"
            @click="toggleCheck(i)"
            class="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
            :class="checked[i] ? 'ring-2 ring-sage shadow-md' : 'ring-1 ring-cream-dark'"
          >
            <div class="aspect-[3/4] bg-cream">
              <img v-if="item.image_base64" :src="'data:image/jpeg;base64,' + item.image_base64" class="w-full h-full object-cover" />
            </div>
            <div class="p-1.5 bg-paper">
              <div class="text-[10px] font-medium text-ink truncate">{{ item.category }} · {{ item.color }}</div>
              <div class="text-[9px] text-ink-faint">{{ item.style }} · {{ item.season }}</div>
            </div>
            <!-- Check -->
            <div class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
              :class="checked[i] ? 'bg-sage text-white' : 'bg-white/80 border border-cream-dark text-transparent'">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
        </div>

        <div class="px-5 pb-5">
          <button @click="onSave" :disabled="saving || checkedCount === 0"
            class="w-full py-3.5 rounded-xl font-medium text-sm text-white bg-sage shadow-lg shadow-sage/20 disabled:opacity-40 transition-all active:scale-[0.97]">
            {{ saving ? '保存中...' : `收入 ${checkedCount} 件到衣橱` }}
          </button>
          <div v-if="savedCount" class="flex items-center justify-center gap-1.5 mt-3 text-sage text-xs font-medium">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            已保存 {{ savedCount }} 件
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseVideo, saveVideoItems } from '../api'

const videoUrl = ref('')
const parsing = ref(false)
const parsedItems = ref<any[]>([])
const checked = ref<boolean[]>([])
const saving = ref(false)
const savedCount = ref(0)

const checkedCount = computed(() => checked.value.filter(Boolean).length)

function toggleCheck(i: number) { checked.value[i] = !checked.value[i] }

async function onParse() {
  if (!videoUrl.value) return
  parsing.value = true
  parsedItems.value = []
  savedCount.value = 0
  try {
    const { data } = await parseVideo(videoUrl.value)
    parsedItems.value = data.items ?? []
    checked.value = parsedItems.value.map(() => true)
  } catch (e: any) {
    alert('解析失败: ' + (e.response?.data?.message || e.message))
  } finally { parsing.value = false }
}

async function onSave() {
  const itemsToSave = parsedItems.value
    .filter((_, i) => checked.value[i])
    .map((item) => ({
      image_base64: item.image_base64, category: item.category, color: item.color,
      style: item.style, season: item.season,
      name: `${item.color || ''}${item.category || '衣物'}`,
    }))
  if (itemsToSave.length === 0) return
  saving.value = true
  try {
    const { data } = await saveVideoItems(itemsToSave)
    savedCount.value = data.ids?.length ?? 0
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally { saving.value = false }
}
</script>
