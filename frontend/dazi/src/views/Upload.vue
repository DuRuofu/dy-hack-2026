<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[11px] tracking-[0.3em] uppercase font-medium mb-1.5">Capture</p>
        <h1 class="font-serif text-2xl text-white font-bold">拍照收录</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <!-- Two-column layout -->
    <div class="flex gap-5 px-4 pt-4 pb-6 max-w-6xl mx-auto h-[calc(100vh-150px)] overflow-hidden">
      <!-- Left: Input -->
      <div class="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
        <!-- Photo upload -->
        <div class="bg-paper rounded-2xl border border-cream-dark p-4">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1.5 h-4 bg-coral rounded-full"></div>
            <h3 class="text-sm font-semibold text-ink">拍照上传</h3>
          </div>
          <label class="block cursor-pointer">
            <input type="file" accept="image/*" capture="environment" @change="onFileChange" class="hidden" />
            <div v-if="!previewUrl" class="flex flex-col items-center justify-center py-10 rounded-xl bg-cream border border-dashed border-cream-dark hover:border-coral/30 transition-colors">
              <svg class="w-8 h-8 text-ink-faint mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span class="text-xs text-ink-faint">点击拍照或选择图片</span>
            </div>
            <div v-else class="relative rounded-xl overflow-hidden">
              <img :src="previewUrl" class="w-full h-40 object-contain bg-cream" />
              <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">重选</div>
            </div>
          </label>
          <button @click="onRecognize" :disabled="!file || recognizing"
            class="mt-3 w-full py-2.5 rounded-xl text-xs font-medium text-white bg-charcoal disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <svg v-if="recognizing" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span>{{ recognizing ? '识别中...' : 'AI 识别' }}</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-cream-dark"></div>
          <span class="text-[10px] text-ink-faint tracking-wider uppercase">或者</span>
          <div class="flex-1 h-px bg-cream-dark"></div>
        </div>

        <!-- Taobao import -->
        <div class="bg-paper rounded-2xl border border-cream-dark p-4">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1.5 h-4 bg-warm rounded-full"></div>
            <h3 class="text-sm font-semibold text-ink">链接导入</h3>
          </div>
          <input v-model="taobaoUrl" placeholder="粘贴淘宝/天猫链接..."
            class="w-full px-4 py-3 rounded-xl bg-cream border-0 text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-warm/30 mb-3" />
          <button @click="onTaobaoImport" :disabled="!taobaoUrl || importingTaobao"
            class="w-full py-2.5 rounded-xl text-xs font-medium text-white bg-warm disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-1.5">
            <svg v-if="importingTaobao" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span>{{ importingTaobao ? '导入中...' : '导入商品' }}</span>
          </button>
          <p v-if="taobaoError" class="text-[11px] text-coral mt-2">{{ taobaoError }}</p>
          <p class="text-[10px] text-ink-faint/60 mt-2">支持 item.taobao.com / detail.tmall.com</p>
        </div>
      </div>

      <!-- Right: Result -->
      <div class="flex-1 min-w-0 overflow-y-auto">
        <div v-if="result" class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
          <div class="px-5 py-3 border-b border-cream-dark/50 flex items-center gap-2">
            <div class="w-1.5 h-4 bg-sage rounded-full"></div>
            <span class="text-[11px] tracking-[0.15em] uppercase text-ink-faint font-medium">识别结果</span>
            <span v-if="result.oss_url" class="text-[10px] text-ink-faint ml-auto">图片已识别</span>
          </div>

          <!-- Preview image -->
          <div v-if="result.oss_url" class="px-5 pt-4">
            <div class="w-full h-40 rounded-xl overflow-hidden bg-cream ring-1 ring-cream-dark">
              <img :src="result.oss_url" class="w-full h-full object-cover scale-110" />
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="text-[11px] text-ink-faint tracking-[0.15em] uppercase mb-1.5 block">名称</label>
              <input v-model="result.name"
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

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center h-full text-ink-faint">
          <div class="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center text-3xl mb-3"> </div>
          <p class="font-serif text-base text-ink-light mb-1">等待收录</p>
          <p class="text-xs">左侧拍照或粘贴链接，AI 自动识别</p>
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

// Taobao
const taobaoUrl = ref('')
const importingTaobao = ref(false)
const taobaoError = ref('')

const taobaoMock: Record<string, { name: string; category: string; color: string; style: string; season: string; oss_url: string }> = {
  '729402752700': { name: '白色撞色猫爪印花短袖 T 恤', category: 'top', color: 'white', style: 'casual', season: 'summer', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
  '789012': { name: '蓝色针织拼接白色网纱鱼尾长裙', category: 'dress', color: 'blue', style: 'elegant', season: 'spring', oss_url: '/images/c70754b3-be34-49d8-85e6-157e4de70c20.jpg' },
  '345678': { name: '蓝色格纹三件套西装套装', category: 'top', color: 'blue', style: 'business', season: 'all', oss_url: '/images/548443f8-777e-4c95-9b1a-8c3ef2eac632.jpg' },
  '111222': { name: '米白色方领泡泡袖蕾丝中长连衣裙', category: 'dress', color: 'beige', style: 'sweet', season: 'spring', oss_url: '/images/ec2b8f27-e9d2-4613-a388-d042ab570c3b.jpg' },
  '333444': { name: '黑灰色扎染阔腿牛仔裤', category: 'bottom', color: 'black', style: 'street', season: 'all', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
}

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
  { value: 'elegant', label: '优雅' }, { value: 'business', label: '商务' },
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

function extractId(url: string): string | null {
  const m = url.match(/[?&]id=(\d+)/)
  return m ? m[1] : null
}

async function onTaobaoImport() {
  const url = taobaoUrl.value.trim()
  if (!url) return
  importingTaobao.value = true
  taobaoError.value = ''
  saved.value = false
  await new Promise(r => setTimeout(r, 1000))
  const id = extractId(url)
  const item = id ? taobaoMock[id] : null
  if (item) {
    result.value = { ...item }
    taobaoUrl.value = ''
    previewUrl.value = ''
    file.value = null
  } else {
    taobaoError.value = '未能识别该链接，请尝试其他商品链接'
  }
  importingTaobao.value = false
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
