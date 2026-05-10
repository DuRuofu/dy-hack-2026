<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[11px] tracking-[0.3em] uppercase font-medium mb-1.5">Capture</p>
        <h1 class="font-serif text-2xl text-white font-bold">拍照收录</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
        <p class="text-white/40 text-xs mt-1.5">AI 自动识别衣物信息</p>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <div class="px-4 pt-4 pb-6 space-y-4 relative z-10">
      <!-- Upload Card -->
      <label class="block bg-paper rounded-2xl border border-cream-dark cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md">
        <input type="file" accept="image/*" capture="environment" @change="onFileChange" class="hidden" />
        <div v-if="!previewUrl" class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-ink">拍摄或选择衣物照片</span>
          <span class="text-[11px] text-ink-faint mt-1">支持 JPG、PNG · 单件衣物效果最佳</span>
        </div>
        <div v-else class="relative">
          <img :src="previewUrl" class="w-full max-h-72 object-contain bg-cream" />
          <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full">
            重新选择
          </div>
        </div>
      </label>

      <!-- CTA -->
      <button @click="onRecognize" :disabled="!file || recognizing"
        class="w-full py-4 rounded-2xl font-medium text-sm tracking-wide text-white bg-charcoal shadow-xl shadow-charcoal/20 disabled:opacity-40 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
        <svg v-if="recognizing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <span>{{ recognizing ? 'AI 识别中...' : '开始识别' }}</span>
      </button>

      <!-- Result -->
      <div v-if="result" class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
        <div class="px-5 py-3 border-b border-cream-dark/50 flex items-center gap-2">
          <div class="w-1.5 h-4 bg-sage rounded-full"></div>
          <span class="text-[11px] tracking-[0.15em] uppercase text-ink-faint font-medium">识别结果</span>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">名称</label>
            <input v-model="result.name" placeholder="如：白色亚麻衬衫"
              class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30" />
          </div>
          <div>
            <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">品类</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="c in categories" :key="c.value"
                @click="result.category = c.value"
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                :class="result.category === c.value ? 'bg-charcoal text-white' : 'bg-cream text-ink-light'"
              >{{ c.label }}</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">颜色</label>
              <select v-model="result.color" class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral/30">
                <option v-for="c in colors" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">风格</label>
              <select v-model="result.style" class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral/30">
                <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">季节</label>
            <select v-model="result.season" class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral/30">
              <option v-for="s in seasons" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>
        <div class="px-5 pb-5">
          <button @click="onSave" :disabled="saving"
            class="w-full py-3.5 rounded-xl font-medium text-sm text-white bg-sage shadow-lg shadow-sage/20 disabled:opacity-50 transition-all active:scale-[0.97]">
            {{ saving ? '保存中...' : '收入衣橱' }}
          </button>
          <div v-if="saved" class="flex items-center justify-center gap-1.5 mt-3 text-sage text-xs font-medium">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            已收入衣橱
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { recognizeImage, addClothing } from '../api'
import UserAvatar from '../components/UserAvatar.vue'

const file = ref<File | null>(null)
const previewUrl = ref('')
const recognizing = ref(false)
const saving = ref(false)
const saved = ref(false)
const result = ref<any>(null)

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

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    file.value = input.files[0]
    previewUrl.value = URL.createObjectURL(input.files[0])
    result.value = null
    saved.value = false
  }
}

async function onRecognize() {
  if (!file.value) return
  recognizing.value = true
  saved.value = false
  try {
    const { data } = await recognizeImage(file.value)
    result.value = {
      name: data.name ?? '', category: data.category ?? 'top',
      color: data.color ?? '', style: data.style ?? '',
      season: data.season ?? '', oss_url: data.oss_url ?? '',
    }
  } catch (e: any) {
    alert('识别失败: ' + (e.response?.data?.message || e.message))
  } finally { recognizing.value = false }
}

async function onSave() {
  if (!result.value) return
  saving.value = true
  try {
    await addClothing({
      name: result.value.name || '未命名衣物', category: result.value.category,
      color: result.value.color, style: result.value.style, season: result.value.season,
      oss_url: result.value.oss_url, source: 'upload',
    })
    saved.value = true
  } catch (e: any) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  } finally { saving.value = false }
}
</script>
