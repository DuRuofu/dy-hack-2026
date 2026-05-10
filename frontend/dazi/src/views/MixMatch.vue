<template>
  <div class="min-h-screen bg-cream">
    <div class="bg-charcoal grain relative overflow-hidden">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5">Mix & Match</p>
        <h1 class="font-serif text-2xl text-white font-bold">自由搭配</h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
      </div>
      <div class="absolute -right-8 top-2 w-32 h-32 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-8 w-20 h-20 rounded-full border border-white/5"></div>
    </div>

    <!-- Two-column layout -->
    <div class="flex gap-5 px-4 pt-4 pb-6 max-w-7xl mx-auto h-[calc(100vh-150px)] overflow-hidden">
      <!-- Left 70%: Category drawers -->
      <div class="flex-[7] min-w-0 overflow-y-auto space-y-3 pr-1">
        <div v-for="cat in categories" :key="cat.value"
          class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
          <button @click="toggleCat(cat.value)"
            class="w-full px-5 py-3 flex items-center justify-between transition-colors hover:bg-cream/50">
            <div class="flex items-center gap-3">
              <span class="text-base">{{ cat.icon }}</span>
              <span class="text-sm font-semibold text-ink">{{ cat.label }}</span>
              <span class="text-[10px] text-ink-faint">{{ selectedByCat[cat.value].length }}/2</span>
            </div>
            <svg class="w-4 h-4 text-ink-faint transition-transform duration-300"
              :class="openCats.has(cat.value) ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="openCats.has(cat.value)" class="px-4 pb-4 grid grid-cols-4 gap-2">
            <div v-for="item in itemsByCat[cat.value]" :key="item.id"
              @click="toggleItem(cat.value, item)"
              class="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
              :class="isSelected(cat.value, item.id)
                ? 'ring-2 ring-coral shadow-md scale-[0.95]'
                : 'ring-1 ring-cream-dark hover:ring-ink/20'"
            >
              <img :src="item.oss_url" class="w-full h-full object-cover scale-110" />
              <div v-if="isSelected(cat.value, item.id)"
                class="absolute inset-0 bg-coral/20 flex items-center justify-center">
                <div class="w-5 h-5 rounded-full bg-coral text-white flex items-center justify-center text-[10px] font-bold">
                  {{ getIndex(cat.value, item.id) }}
                </div>
              </div>
              <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                <div class="text-[9px] text-white truncate leading-tight">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected summary -->
        <div class="bg-paper rounded-2xl border border-cream-dark p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-serif text-sm font-bold text-coral">已选</span>
              <span class="text-xs text-ink">{{ totalSelected }} 件</span>
            </div>
            <button @click="clearAll" v-if="totalSelected" class="text-[10px] text-ink-faint hover:text-coral transition-colors">清空</button>
          </div>
          <div v-if="totalSelected" class="flex flex-wrap gap-1.5">
            <span v-for="item in allSelected" :key="item.id"
              class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-cream border border-cream-dark text-[10px] text-ink">
              {{ item.name }}
              <button @click="toggleItem(item.category, item)"
                class="w-3.5 h-3.5 rounded-full bg-cream-dark text-ink-faint flex items-center justify-center text-[8px] hover:bg-coral/10 hover:text-coral">×</button>
            </span>
          </div>
          <p v-else class="text-[11px] text-ink-faint">展开上方分类，点击选择衣物</p>
        </div>
      </div>

      <!-- Right 30%: AI Panel -->
      <div class="flex-[3] min-w-0 flex flex-col gap-3 overflow-y-auto">
        <!-- Empty state -->
        <div v-if="!evaluation" class="bg-paper rounded-2xl border border-cream-dark flex flex-col items-center justify-center min-h-[240px] text-ink-faint p-6">
          <div class="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center text-2xl mb-3"> </div>
          <p class="font-serif text-sm text-ink-light mb-1">等待点评</p>
          <p class="text-[11px] text-center leading-relaxed">选择单品后点击下方按钮，AI 为你分析搭配</p>
        </div>

        <!-- Result -->
        <template v-else>
          <div class="bg-paper rounded-2xl border border-cream-dark overflow-hidden">
            <div class="px-4 py-3 border-b border-cream-dark/50 flex items-center gap-2">
              <div class="w-1.5 h-3 bg-coral rounded-full"></div>
              <span class="text-[10px] tracking-[0.15em] uppercase text-ink-faint font-medium">AI 评价</span>
            </div>
            <div class="p-4">
              <!-- Score ring -->
              <div class="flex items-center gap-4 mb-4">
                <div class="relative w-16 h-16 shrink-0">
                  <svg class="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#f0ece6" stroke-width="2.5" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" :stroke="scoreColor" stroke-width="2.5"
                      :stroke-dasharray="`${evaluation.score}, 100`" stroke-linecap="round" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="font-serif text-lg font-bold" :class="scoreTextColor">{{ evaluation.score }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-xs font-semibold text-ink">穿搭评分</p>
                  <p class="text-[10px] text-ink-faint mt-0.5">{{ scoreDesc }}</p>
                </div>
              </div>

              <!-- Pros -->
              <div v-if="evaluation.pros?.length" class="mb-3">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <div class="w-4 h-4 rounded-full bg-sage/10 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span class="text-[9px] tracking-[0.15em] uppercase text-sage font-medium">优点</span>
                </div>
                <ul class="space-y-1">
                  <li v-for="p in evaluation.pros" :key="p" class="text-[11px] text-ink flex items-start gap-1.5">
                    <span class="text-sage mt-0.5 text-[5px]">●</span>{{ p }}
                  </li>
                </ul>
              </div>

              <!-- Cons -->
              <div v-if="evaluation.cons?.length" class="mb-3">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <div class="w-4 h-4 rounded-full bg-coral/10 flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span class="text-[9px] tracking-[0.15em] uppercase text-coral font-medium">不足</span>
                </div>
                <ul class="space-y-1">
                  <li v-for="c in evaluation.cons" :key="c" class="text-[11px] text-ink flex items-start gap-1.5">
                    <span class="text-coral mt-0.5 text-[5px]">●</span>{{ c }}
                  </li>
                </ul>
              </div>

              <!-- Suggestion -->
              <div v-if="evaluation.suggestion" class="p-3 rounded-xl bg-cream border border-cream-dark">
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-[9px] tracking-[0.15em] uppercase text-warm font-medium">改进建议</span>
                </div>
                <p class="text-[11px] text-ink leading-relaxed">{{ evaluation.suggestion }}</p>
              </div>
            </div>
          </div>

          <!-- Mini chat -->
          <div class="bg-paper rounded-2xl border border-cream-dark flex flex-col min-h-[240px]">
            <div class="px-4 py-2.5 border-b border-cream-dark/50">
              <span class="text-[10px] tracking-[0.15em] uppercase text-ink-faint font-medium">穿搭对话</span>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2.5 text-[11px]">
              <div v-for="(msg, i) in chatMessages" :key="i">
                <div v-if="msg.type === 'user'" class="flex gap-2 justify-end">
                  <div class="bg-charcoal text-white rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[85%]">{{ msg.text }}</div>
                  <img src="/avatar.jpeg" class="w-5 h-5 rounded-full object-cover shrink-0" />
                </div>
                <div v-else class="flex gap-2">
                  <div class="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center text-coral text-[9px] shrink-0 font-bold">搭</div>
                  <div class="bg-cream rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[85%]">{{ msg.text }}</div>
                </div>
              </div>
              <div v-if="chatLoading" class="flex gap-2">
                <div class="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center text-coral text-[9px] shrink-0 font-bold">搭</div>
                <div class="bg-cream rounded-2xl rounded-tl-sm px-3 py-1.5 flex gap-1 items-center">
                  <span class="w-1 h-1 bg-coral rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-1 h-1 bg-coral rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-1 h-1 bg-coral rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>
            <div class="p-3 pt-0 flex gap-2">
              <input v-model="chatInput" @keyup.enter="onChatSend"
                placeholder="问问 AI 怎么改进..."
                class="flex-1 px-3 py-2 rounded-lg bg-cream border-0 text-xs text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-1 focus:ring-coral/30" />
              <button @click="onChatSend" :disabled="!chatInput.trim()"
                class="px-3 py-2 rounded-lg bg-charcoal text-white text-[10px] font-medium disabled:opacity-40 transition-all active:scale-95">发送</button>
            </div>
          </div>
        </template>

        <!-- CTA -->
        <button @click="onEvaluate" :disabled="totalSelected === 0 || evaluating"
          class="w-full py-3 rounded-xl font-medium text-xs tracking-wide text-white bg-charcoal shadow-lg shadow-charcoal/20 disabled:opacity-40 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
          <svg v-if="evaluating" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-20"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span>{{ evaluating ? '分析中...' : '让 AI 点评' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import UserAvatar from '../components/UserAvatar.vue'

const categories = [
  { value: 'top', label: '上衣', icon: '👚' },
  { value: 'bottom', label: '下装', icon: '👖' },
  { value: 'dress', label: '连衣裙', icon: '👗' },
  { value: 'shoes', label: '鞋', icon: '👠' },
  { value: 'bag', label: '包', icon: '👜' },
  { value: 'accessory', label: '配饰', icon: '💍' },
]

const itemsByCat: Record<string, { id: number; name: string; category: string; oss_url: string }[]> = {
  top: [
    { id: 3, name: '黑色格纹拼接假两件POLO衫', category: 'top', oss_url: '/images/38b1b3ab-a5bb-4dfa-a44d-1be9d4ca8fe9.jpg' },
    { id: 4, name: '白色麻花针织短袖POLO衫', category: 'top', oss_url: '/images/e34ad1de-f60b-41ed-bb4a-496f7e311e04.jpg' },
    { id: 15, name: '深蓝色樱花刺绣T恤', category: 'top', oss_url: '/images/bb11e31f-3d1f-4985-aa7f-443385efbc3e.jpg' },
    { id: 16, name: '浅灰色三条杠拼接T恤', category: 'top', oss_url: '/images/8e39687a-5606-4aea-93fa-7bfbb0a68c28.jpg' },
    { id: 17, name: '白色V领不规则褶皱T恤', category: 'top', oss_url: '/images/6f2fa181-4bb1-45c5-8635-baa86e65d2e4.jpg' },
    { id: 18, name: '深蓝色三条杠插肩袖T恤', category: 'top', oss_url: '/images/1f433f26-081c-4393-bef9-56e215711e7f.jpg' },
    { id: 23, name: '白色撞色猫爪印花T恤', category: 'top', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
    { id: 52, name: '蓝白黄格纹宽松长袖衬衫', category: 'top', oss_url: '/images/4f089203-8f7e-4d40-b2ad-a6beeb39b6f6.jpg' },
  ],
  bottom: [
    { id: 5, name: '黑色蕾丝蝴蝶结阔腿裤', category: 'bottom', oss_url: '/images/77c6866e-787f-47f0-bfc2-3d8a71473356.jpg' },
    { id: 6, name: '黑灰色扎染阔腿牛仔裤', category: 'bottom', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
    { id: 7, name: '黑灰色蛇纹印花微喇牛仔裤', category: 'bottom', oss_url: '/images/03028049-9883-4544-8136-42bd01d49470.jpg' },
    { id: 8, name: '卡其色工装微喇牛仔裤', category: 'bottom', oss_url: '/images/706db99c-e3a9-4848-ba05-9297a78e6499.jpg' },
    { id: 10, name: '多巴胺黄色工装阔腿裤', category: 'bottom', oss_url: '/images/c8fa1c69-e66b-4421-b851-5dd00017fcbd.jpg' },
    { id: 11, name: '黑色高腰紧身包臀短裤', category: 'bottom', oss_url: '/images/43f44195-3300-45be-82b6-9323d1680e19.jpg' },
    { id: 24, name: '粉色高腰微喇休闲裤', category: 'bottom', oss_url: '/images/c9e753cb-59da-4e31-9967-b03aea3eb241.jpg' },
    { id: 55, name: '浅蓝色立体花朵阔腿裤', category: 'bottom', oss_url: '/images/7a992a43-ecab-4d6a-a688-68d22795c570.jpg' },
  ],
  dress: [
    { id: 2, name: '蓝色针织拼接网纱鱼尾长裙', category: 'dress', oss_url: '/images/c70754b3-be34-49d8-85e6-157e4de70c20.jpg' },
    { id: 28, name: '米白色方领泡泡袖蕾丝连衣裙', category: 'dress', oss_url: '/images/ec2b8f27-e9d2-4613-a388-d042ab570c3b.jpg' },
    { id: 29, name: '藏青色翻领短袖拼接连衣裙', category: 'dress', oss_url: '/images/0d26e242-1d85-4193-acf7-4b123fc68614.jpg' },
    { id: 43, name: '米白色改良旗袍式鱼尾连衣裙', category: 'dress', oss_url: '/images/9bd2835c-2c60-4962-845b-12540d76a4d9.jpg' },
    { id: 44, name: '学院风假两件格纹连衣裙', category: 'dress', oss_url: '/images/785068a3-7395-4e2c-9669-76930606e3e4.jpg' },
  ],
  shoes: [
    { id: 1, name: '米色绒面厚底过膝靴', category: 'shoes', oss_url: '/images/acc72b19-1e5a-4db4-9dc6-f4af0083ba39.jpg' },
    { id: 19, name: '匡威1970s黑色低帮帆布鞋', category: 'shoes', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
    { id: 20, name: 'JEEP SPIRIT吉普老爹鞋', category: 'shoes', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
    { id: 21, name: '棕色系带商务皮鞋', category: 'shoes', oss_url: '/images/2df6b9c8-c5c3-49cb-aeb2-76c1843e292a.jpg' },
    { id: 22, name: '黑色漆皮厚底小皮鞋', category: 'shoes', oss_url: '/images/72751840-5049-4bb7-bb0e-e56b3ddb15e6.jpg' },
    { id: 49, name: '米白色尖头细跟高跟鞋', category: 'shoes', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
    { id: 51, name: '红色三道杠厚底休闲板鞋', category: 'shoes', oss_url: '/images/69c897bd-c33d-4aa8-8d9f-f7418cad7870.jpg' },
  ],
  bag: [
    { id: 32, name: '米白色菱格纹链条腋下包', category: 'bag', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
    { id: 31, name: '红色亮面迷你手提斜挎包', category: 'bag', oss_url: '/images/a9aee286-a7b1-4211-a5d9-7fb908532e1b.jpg' },
    { id: 37, name: '史迪奇印花帆布托特包', category: 'bag', oss_url: '/images/52c14f81-8e44-46b1-8926-bde5fb677371.jpg' },
    { id: 38, name: '黑色猫咪印花帆布托特包', category: 'bag', oss_url: '/images/585c072a-08bd-4c77-9db8-1256b9c3e5ac.jpg' },
    { id: 42, name: '米色编织托特包', category: 'bag', oss_url: '/images/0e70b7f6-76af-4a02-8311-c5e9c9713f35.jpg' },
    { id: 35, name: '粉棕拼色学院风双肩小背包', category: 'bag', oss_url: '/images/3831b87a-ef5f-4ed2-ba3f-8efe1a17e929.jpg' },
  ],
  accessory: [
    { id: 34, name: '银镶钻项链手链套装', category: 'accessory', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
    { id: 25, name: '酒红色COLORADO刺绣棒球帽', category: 'accessory', oss_url: '/images/0dc8bb3f-b0d4-41f9-a763-453d3dc03eef.jpg' },
    { id: 48, name: '黑色方框太阳镜', category: 'accessory', oss_url: '/images/1fcf6f94-3cbb-46f2-991a-df9aa798713e.jpg' },
  ],
}

const openCats = reactive(new Set<string>(['top']))
const selectedByCat = reactive<Record<string, number[]>>({
  top: [], bottom: [], dress: [], shoes: [], bag: [], accessory: [],
})

const evaluating = ref(false)
const evaluation = ref<any>(null)
const chatMessages = ref<{ type: 'user' | 'ai'; text: string }[]>([])
const chatInput = ref('')
const chatLoading = ref(false)

function toggleCat(cat: string) {
  if (openCats.has(cat)) openCats.delete(cat)
  else openCats.add(cat)
}

function toggleItem(cat: string, item: { id: number; category: string }) {
  const ids = selectedByCat[cat]
  const idx = ids.indexOf(item.id)
  if (idx >= 0) {
    ids.splice(idx, 1)
  } else if (ids.length < 2) {
    ids.push(item.id)
  }
}

function isSelected(cat: string, id: number) { return selectedByCat[cat].includes(id) }
function getIndex(cat: string, id: number) { return selectedByCat[cat].indexOf(id) + 1 }
function clearAll() { for (const cat of categories) { selectedByCat[cat.value].length = 0 } }

const totalSelected = computed(() =>
  Object.values(selectedByCat).reduce((s, ids) => s + ids.length, 0)
)

const allSelected = computed(() => {
  const result: { id: number; name: string; category: string }[] = []
  for (const cat of categories) {
    for (const id of selectedByCat[cat.value]) {
      const item = itemsByCat[cat.value]?.find(i => i.id === id)
      if (item) result.push(item)
    }
  }
  return result
})

const scoreColor = computed(() => {
  if (!evaluation.value) return '#e2e8f0'
  return evaluation.value.score >= 80 ? '#6b9e6b' : evaluation.value.score >= 60 ? '#c4956a' : '#e8654a'
})
const scoreTextColor = computed(() => {
  if (!evaluation.value) return 'text-ink-faint'
  return evaluation.value.score >= 80 ? 'text-sage' : evaluation.value.score >= 60 ? 'text-warm' : 'text-coral'
})
const scoreDesc = computed(() => {
  if (!evaluation.value) return ''
  return evaluation.value.score >= 85 ? '出色搭配，很有品味' : evaluation.value.score >= 70 ? '不错的搭配，稍加调整更佳' : '搭配有待提升，参考建议优化'
})

async function onEvaluate() {
  if (totalSelected.value === 0) return
  evaluating.value = true
  evaluation.value = null
  chatMessages.value = []

  const desc = allSelected.value.map(i => i.name).join('、')
  await new Promise(r => setTimeout(r, 2500))

  const count = totalSelected.value
  evaluation.value = {
    score: Math.min(95, 65 + count * 4 + Math.floor(Math.random() * 8)),
    pros: [
      `${desc.split('、').slice(0, 2).join('和')}的组合很有想法`,
      '整体色彩搭配和谐，风格统一',
      '选择的单品都很实用，日常可穿性强',
    ].slice(0, Math.min(3, count)),
    cons: [
      '可以考虑加入一件亮色单品作为点缀',
      '配饰略显单薄，加一条项链会更完整',
    ].slice(0, count < 4 ? 2 : 1),
    suggestion: count >= 5
      ? '这套搭配已经很完整了！如果想让造型更有层次感，可以尝试叠穿或者加入一件外套。'
      : '建议再多选几件单品，一套完整的穿搭通常包含上装、下装、鞋子和包包，这样搭配效果会更好。',
  }
}

async function onChatSend() {
  const text = chatInput.value.trim()
  if (!text) return
  chatMessages.value.push({ type: 'user', text })
  chatInput.value = ''
  chatLoading.value = true

  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
  chatLoading.value = false

  // Simple mock responses
  const replies = [
    '可以尝试把其中一件深色单品换成浅色系，整体会更清新～',
    '这套搭配的版型组合很好，建议在配饰上再花点心思',
    '如果天气凉的话，外面搭一件米色风衣会很出彩',
    '包包可以换成链条款，会更有精致感',
  ]
  chatMessages.value.push({ type: 'ai', text: replies[Math.floor(Math.random() * replies.length)] })
}
</script>
