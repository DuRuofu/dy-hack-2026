<template>
  <div class="min-h-screen bg-cream">
    <!-- Header -->
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 pt-5 pb-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium">My Closet</p>
          <div class="flex items-center gap-2.5">
            <span class="text-white/50 text-[11px]">Hi, Xiao Ming</span>
            <div class="w-7 h-7 rounded-full bg-cream/15 flex items-center justify-center text-white text-[11px] font-medium ring-1 ring-white/10">明</div>
          </div>
        </div>
        <h1 class="font-serif text-2xl text-white font-bold">我的衣橱</h1>
        <p class="text-white/40 text-xs mt-1.5">{{ loading ? '...' : `${items.length} 件衣物` }}</p>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <!-- Filter pills -->
    <div class="sticky top-0 z-30 bg-cream/90 backdrop-blur-xl border-b border-cream-dark/50 px-4 py-3">
      <div class="flex gap-2 overflow-x-auto pb-0.5">
        <button
          @click="filterCategory = ''"
          class="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 tracking-wide"
          :class="filterCategory === '' ? 'bg-charcoal text-white' : 'bg-paper text-ink-light border border-cream-dark'"
        >全部</button>
        <button
          v-for="c in categories"
          :key="c.value"
          @click="filterCategory = c.value"
          class="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 tracking-wide"
          :class="filterCategory === c.value ? 'bg-charcoal text-white' : 'bg-paper text-ink-light border border-cream-dark'"
        >{{ c.label }}</button>
      </div>
    </div>

    <div class="px-4 py-5">
      <!-- Grid -->
      <div v-if="filtered.length" class="grid grid-cols-4 gap-2">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="bg-paper rounded-lg overflow-hidden border border-cream-dark group cursor-pointer"
          @click="editing = { ...item }"
        >
          <div class="relative aspect-square overflow-hidden">
            <img
              v-if="item.oss_url || item.ossUrl"
              :src="item.oss_url || item.ossUrl"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="w-full h-full bg-cream-dark flex items-center justify-center">
              <span class="text-xl opacity-20"> </span>
            </div>
          </div>
          <div class="p-1.5">
            <div class="text-[10px] font-medium text-ink truncate">{{ item.name }}</div>
            <div class="text-[8px] text-ink-faint tracking-wider uppercase truncate">
              {{ labelMap.category[item.category] || item.category }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 text-ink-faint">
        <div class="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center text-3xl mb-4"> </div>
        <p class="font-serif text-lg text-ink-light">衣橱还是空的</p>
        <p class="text-xs mt-1">拍照上传或视频解析来收录衣物</p>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="editing" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end" @click.self="editing = null">
          <div class="w-full bg-paper rounded-t-3xl p-6 pb-8 slide-up max-h-[85vh] overflow-y-auto">
            <div class="w-10 h-1 bg-cream-dark rounded-full mx-auto mb-5"></div>
            <h3 class="font-serif text-lg font-bold text-ink mb-5">编辑衣物</h3>

            <div class="space-y-4">
              <div>
                <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">名称</label>
                <input v-model="editing.name"
                  class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30" />
              </div>

              <div>
                <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">品类</label>
                <div class="flex flex-wrap gap-2">
                  <button v-for="c in categories" :key="c.value"
                    @click="editing.category = c.value"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    :class="editing.category === c.value ? 'bg-charcoal text-white' : 'bg-cream text-ink-light'"
                  >{{ c.label }}</button>
                </div>
              </div>

              <div>
                <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">颜色</label>
                <div class="flex flex-wrap gap-2">
                  <button v-for="c in colors" :key="c.value"
                    @click="editing.color = c.value"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    :class="editing.color === c.value ? 'bg-charcoal text-white' : 'bg-cream text-ink-light'"
                  >{{ c.label }}</button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">风格</label>
                  <select v-model="editing.style" class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral/30">
                    <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">季节</label>
                  <select v-model="editing.season" class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral/30">
                    <option v-for="s in seasons" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button @click="editing = null" class="flex-1 py-3.5 rounded-xl text-sm font-medium bg-cream text-ink-light">取消</button>
              <button @click="onSaveEdit" :disabled="saving"
                class="flex-1 py-3.5 rounded-xl text-sm font-medium text-white bg-charcoal shadow-lg shadow-charcoal/20 disabled:opacity-50">
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWardrobeStore } from '../stores/wardrobe'
import { storeToRefs } from 'pinia'
import { updateClothing } from '../api'

const store = useWardrobeStore()
const { items, loading } = storeToRefs(store)

const filterCategory = ref('')
const editing = ref<any>(null)
const saving = ref(false)

const categories = [
  { value: 'top', label: '上衣' }, { value: 'bottom', label: '下装' },
  { value: 'dress', label: '连衣裙' }, { value: 'shoes', label: '鞋' },
  { value: 'bag', label: '包' }, { value: 'accessory', label: '配饰' },
]
const colors = [
  { value: 'black', label: '黑' }, { value: 'white', label: '白' },
  { value: 'red', label: '红' }, { value: 'blue', label: '蓝' },
  { value: 'green', label: '绿' }, { value: 'yellow', label: '黄' },
  { value: 'pink', label: '粉' }, { value: 'gray', label: '灰' },
  { value: 'brown', label: '棕' }, { value: 'beige', label: '米' },
  { value: 'multi', label: '多色' },
]
const styles = [
  { value: 'casual', label: '休闲' }, { value: 'formal', label: '通勤' },
  { value: 'sport', label: '运动' }, { value: 'sweet', label: '甜美' },
  { value: 'street', label: '街头' }, { value: 'minimal', label: '极简' },
]
const seasons = [
  { value: 'spring', label: '春' }, { value: 'summer', label: '夏' },
  { value: 'autumn', label: '秋' }, { value: 'winter', label: '冬' },
  { value: 'all', label: '四季' },
]
const labelMap: Record<string, Record<string, string>> = {
  category: Object.fromEntries(categories.map(c => [c.value, c.label])),
  color: Object.fromEntries(colors.map(c => [c.value, c.label])),
}

const filtered = computed(() =>
  filterCategory.value
    ? items.value.filter((i) => i.category === filterCategory.value)
    : items.value,
)

onMounted(() => loadWardrobe())
function loadWardrobe() { store.fetchWardrobe() }

async function onSaveEdit() {
  if (!editing.value) return
  saving.value = true
  try {
    await updateClothing(editing.value.id, {
      name: editing.value.name, category: editing.value.category,
      color: editing.value.color, style: editing.value.style, season: editing.value.season,
    })
    editing.value = null
    loadWardrobe()
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally { saving.value = false }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up { animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
