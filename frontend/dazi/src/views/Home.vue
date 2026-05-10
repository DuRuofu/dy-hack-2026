<template>
  <div class="min-h-screen bg-cream">
    <!-- Hero -->
    <div class="relative overflow-hidden bg-charcoal grain">
      <div class="relative z-10 px-6 py-5">
        <p class="text-warm-light text-xs tracking-[0.3em] uppercase font-medium mb-2.5">
          AI Stylist<span class="text-white/50 font-normal normal-case tracking-normal ml-2 text-sm">你的私人穿搭顾问</span>
        </p>
        <h1 class="font-serif text-3xl text-white font-bold leading-tight">
          搭<span class="text-coral">子</span>
        </h1>
        <div class="absolute right-6 top-1/2 -translate-y-1/2">
          <UserAvatar />
        </div>
      </div>
      <div class="absolute -right-10 top-6 w-40 h-40 rounded-full border border-white/5"></div>
      <div class="absolute -right-4 top-12 w-28 h-28 rounded-full border border-white/5"></div>
    </div>

    <!-- Two-column layout -->
    <div class="flex gap-6 px-6 pt-6 pb-6 max-w-7xl mx-auto h-[calc(100vh-180px)] overflow-hidden">
      <!-- Left: Chat Panel -->
      <div class="w-80 shrink-0 flex flex-col gap-3">
        <!-- Chat messages -->
        <div ref="chatBody" class="bg-paper rounded-2xl border border-cream-dark p-4 flex-1 min-h-0 overflow-y-auto space-y-3">
          <div class="text-xs text-ink-faint text-center">— 今日穿搭推荐 —</div>

          <!-- AI greeting -->
          <div class="flex gap-2">
            <div class="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-coral text-xs shrink-0 font-bold">搭</div>
            <div class="bg-cream rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] text-ink leading-relaxed">
              你好 Olivia！今天想穿什么？选场景或直接告诉我吧～
            </div>
          </div>

          <!-- Chat messages -->
          <template v-for="(msg, i) in messages" :key="i">
            <!-- User -->
            <div v-if="msg.type === 'user'" class="flex gap-2 justify-end">
              <div class="bg-charcoal text-white rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] leading-relaxed max-w-[85%]">{{ msg.text }}</div>
              <img src="/avatar.jpeg" class="w-7 h-7 rounded-full object-cover shrink-0" />
            </div>
            <!-- AI -->
            <div v-else class="flex gap-2">
              <div class="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-coral text-xs shrink-0">AI</div>
              <div class="bg-cream rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] text-ink leading-relaxed">{{ msg.text }}</div>
            </div>
          </template>

          <!-- Typing indicator -->
          <div v-if="typing" class="flex gap-2">
            <div class="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-coral text-xs shrink-0">AI</div>
            <div class="bg-cream rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1.5 items-center">
              <span class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-coral rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Quick scene chips -->
        <div class="flex flex-wrap gap-1.5">
          <button v-for="scene in scenes" :key="scene"
            @click="onSelectScene(scene)"
            class="px-3 py-1.5 rounded-full text-xs bg-paper border border-cream-dark text-ink-light hover:border-charcoal/30 hover:text-ink transition-all active:scale-95">
            {{ scene }}
          </button>
        </div>

        <!-- Chat input -->
        <div class="flex gap-2">
          <input v-model="chatInput"
            @keyup.enter="onSend"
            placeholder="说说你的想法..."
            class="flex-1 px-4 py-3 rounded-xl bg-paper border border-cream-dark text-sm text-ink placeholder:text-ink-faint/50 focus:outline-none focus:ring-2 focus:ring-coral/30" />
          <button @click="onSend" :disabled="!chatInput.trim()"
            class="px-4 py-3 rounded-xl bg-charcoal text-white text-sm font-medium disabled:opacity-40 transition-all active:scale-95">
            发送
          </button>
        </div>
      </div>

      <!-- Right: Outfit Cards -->
      <div class="flex-1 min-w-0 overflow-y-auto space-y-4 pb-2">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="font-serif text-lg text-ink font-bold">{{ currentTitle }}</h2>
          <div class="flex-1 h-px bg-cream-dark"></div>
          <span class="text-[10px] text-ink-faint tracking-wider uppercase">{{ outfits.length }} Plans</span>
        </div>

        <div v-for="(plan, i) in outfits" :key="i"
          class="bg-paper rounded-2xl overflow-hidden border border-cream-dark group">
          <div class="relative h-1 bg-cream-dark">
            <div class="absolute left-0 top-0 h-full rounded-r-full"
              :class="plan.score >= 80 ? 'bg-sage' : plan.score >= 60 ? 'bg-warm' : 'bg-coral'"
              :style="{ width: plan.score + '%' }"></div>
          </div>

          <div class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[11px] text-ink-faint tracking-wider uppercase">{{ plan.label }}</span>
                <h3 class="text-sm font-semibold text-ink mt-0.5">{{ plan.reason }}</h3>
              </div>
              <div
                class="shrink-0 ml-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                :class="plan.score >= 80 ? 'bg-sage/10 text-sage' : plan.score >= 60 ? 'bg-warm/10 text-warm' : 'bg-coral/10 text-coral'"
              >
                {{ plan.score }}
              </div>
            </div>

            <div class="flex gap-2.5 overflow-x-auto scroll-snap-x pb-1">
              <div v-for="item in plan.items" :key="item.name" class="flex-shrink-0 scroll-snap-start w-24">
                <div class="w-24 h-24 rounded-xl overflow-hidden bg-cream mb-2 ring-1 ring-cream-dark">
                  <img :src="item.oss_url" class="w-full h-full object-cover scale-110" />
                </div>
                <div class="text-xs font-medium text-ink truncate">{{ item.name }}</div>
                <div class="text-[10px] text-ink-faint tracking-wide uppercase">{{ item.role }}</div>
              </div>
            </div>

            <!-- Save button -->
            <button @click="onSavePlan(plan._key)"
              class="mt-3 w-full py-2.5 rounded-xl text-xs font-medium transition-all active:scale-[0.97]"
              :class="savedPlans.has(plan._key) ? 'bg-sage/10 text-sage' : 'bg-cream text-ink-light hover:bg-charcoal hover:text-white'">
              {{ savedPlans.has(plan._key) ? '已保存到搭配方案' : '保存到搭配方案' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import UserAvatar from '../components/UserAvatar.vue'
import { addPlan } from '../stores/planList'

const scenes = ['通勤上班', '约会出行', '日常休闲', '运动健身', '朋友聚会']
const chatInput = ref('')
const messages = ref<{ type: 'user' | 'ai'; text: string }[]>([])
const typing = ref(false)
const currentScene = ref('日常休闲')
const chatBody = ref<HTMLElement>()

const currentTitle = computed(() => {
  const map: Record<string, string> = { '通勤上班': '通勤搭配', '约会出行': '约会搭配', '日常休闲': '日常搭配', '运动健身': '运动搭配', '朋友聚会': '聚会搭配' }
  return map[currentScene.value] || '推荐方案'
})

const sceneOutfits: Record<string, any[]> = {
  '通勤上班': [
    {
      label: '轻商务套装',
      reason: '蓝色格纹三件套利落干练，尖头细高跟拉长线条，菱格纹腋下包增添精致感',
      score: 92,
      items: [
        { name: '蓝色格纹三件套西装套装', role: 'OUTER', oss_url: '/images/548443f8-777e-4c95-9b1a-8c3ef2eac632.jpg' },
        { name: '米白色尖头细跟高跟鞋', role: 'SHOES', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
        { name: '米白色菱格纹链条腋下包', role: 'BAG', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
      ],
    },
    {
      label: '优雅通勤裙',
      reason: '藏青翻领连衣裙端庄显瘦，尖头高跟鞋提升气场，腋下包简洁利落',
      score: 88,
      items: [
        { name: '藏青色翻领短袖拼接中长连衣裙', role: 'DRESS', oss_url: '/images/0d26e242-1d85-4193-acf7-4b123fc68614.jpg' },
        { name: '米白色尖头细跟高跟鞋', role: 'SHOES', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
        { name: '米白色菱格纹链条腋下包', role: 'BAG', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
      ],
    },
    {
      label: '干练黑白配',
      reason: '白色V领T恤搭配黑色开叉半身裙，棕色皮鞋稳重有型，邮差包实用百搭',
      score: 85,
      items: [
        { name: '白色V领不规则褶皱短袖T恤', role: 'TOP', oss_url: '/images/6f2fa181-4bb1-45c5-8635-baa86e65d2e4.jpg' },
        { name: '黑色不规则开叉A字半身裙', role: 'BOTTOM', oss_url: '/images/f0f2faa2-1765-4d99-8d09-30eb32e9fbb3.jpg' },
        { name: '棕色系带商务皮鞋', role: 'SHOES', oss_url: '/images/2df6b9c8-c5c3-49cb-aeb2-76c1843e292a.jpg' },
        { name: '马克华菲黑灰老花斜挎邮差包', role: 'BAG', oss_url: '/images/2a2217d9-67fc-42ac-ae13-23b085120e2d.jpg' },
      ],
    },
  ],
  '约会出行': [
    {
      label: '浪漫蕾丝裙',
      reason: '米白蕾丝连衣裙温柔浪漫，珍珠蝴蝶结高跟鞋和红色迷你包点亮造型，项链增添精致度',
      score: 90,
      items: [
        { name: '米白色方领泡泡袖蕾丝中长连衣裙', role: 'DRESS', oss_url: '/images/ec2b8f27-e9d2-4613-a388-d042ab570c3b.jpg' },
        { name: '米白色珍珠蝴蝶结尖头高跟鞋', role: 'SHOES', oss_url: '/images/ab72df95-b540-424e-bc8a-f39e56cf80cf.jpg' },
        { name: '红色亮面迷你手提斜挎包', role: 'BAG', oss_url: '/images/a9aee286-a7b1-4211-a5d9-7fb908532e1b.jpg' },
        { name: '银镶钻项链手链套装', role: 'ACCESSORY', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
      ],
    },
    {
      label: '甜美鱼尾裙',
      reason: '蓝色针织拼接网纱鱼尾长裙飘逸柔美，珍珠高跟鞋和牛仔纹腋下包清新减龄',
      score: 86,
      items: [
        { name: '蓝色针织拼接白色网纱鱼尾长裙', role: 'DRESS', oss_url: '/images/c70754b3-be34-49d8-85e6-157e4de70c20.jpg' },
        { name: '米白色珍珠蝴蝶结尖头高跟鞋', role: 'SHOES', oss_url: '/images/ab72df95-b540-424e-bc8a-f39e56cf80cf.jpg' },
        { name: '浅蓝色牛仔纹腋下包', role: 'BAG', oss_url: '/images/bbcaade6-e92c-4a63-8d12-9ab8ede29ebc.jpg' },
      ],
    },
    {
      label: '学院风约会',
      reason: '学院风格纹连衣裙甜美减龄，厚底小皮鞋舒适不累，粉色托特包增加少女感',
      score: 84,
      items: [
        { name: '学院风假两件格纹连衣裙', role: 'DRESS', oss_url: '/images/785068a3-7395-4e2c-9669-76930606e3e4.jpg' },
        { name: '黑色漆皮厚底小皮鞋', role: 'SHOES', oss_url: '/images/72751840-5049-4bb7-bb0e-e56b3ddb15e6.jpg' },
        { name: '浅粉色压花托特包', role: 'BAG', oss_url: '/images/fc1bad1d-a700-4ffa-9dcb-b347c37c68c3.jpg' },
      ],
    },
  ],
  '日常休闲': [
    {
      label: '周末Citywalk',
      reason: '灰色三条杠T恤搭配扎染阔腿牛仔裤，匡威帆布鞋和猫咪印花托特包，松弛又有个性',
      score: 87,
      items: [
        { name: '浅灰色三条杠拼接圆领短袖T恤', role: 'TOP', oss_url: '/images/8e39687a-5606-4aea-93fa-7bfbb0a68c28.jpg' },
        { name: '黑灰色扎染阔腿牛仔裤', role: 'BOTTOM', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
        { name: '匡威1970s黑色低帮帆布鞋', role: 'SHOES', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
        { name: '黑色猫咪印花帆布托特包', role: 'BAG', oss_url: '/images/585c072a-08bd-4c77-9db8-1256b9c3e5ac.jpg' },
      ],
    },
    {
      label: '美式复古风',
      reason: '深蓝樱花刺绣T恤搭配蛇纹微喇牛仔裤，帆布鞋和字母托特包，个性十足',
      score: 85,
      items: [
        { name: '深蓝色樱花刺绣字母宽松短袖T恤', role: 'TOP', oss_url: '/images/bb11e31f-3d1f-4985-aa7f-443385efbc3e.jpg' },
        { name: '黑灰色蛇纹印花微喇牛仔裤', role: 'BOTTOM', oss_url: '/images/03028049-9883-4544-8136-42bd01d49470.jpg' },
        { name: '匡威1970s黑色低帮帆布鞋', role: 'SHOES', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
        { name: '米白色Kitten字母印花帆布托特包', role: 'BAG', oss_url: '/images/b7495c6d-656f-4fa6-9754-a1076d33fab1.jpg' },
      ],
    },
    {
      label: '甜酷少女',
      reason: '白色猫爪印花T恤搭配浅蓝绑带牛仔裙，红色板鞋点睛，史迪奇托特包趣味满满',
      score: 83,
      items: [
        { name: '白色撞色猫爪印花短袖 T 恤', role: 'TOP', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
        { name: '浅蓝色假两件绑带牛仔短裙', role: 'BOTTOM', oss_url: '/images/42770c04-d89b-4145-b3cd-8a9d9e670747.jpg' },
        { name: '红色三道杠厚底休闲板鞋', role: 'SHOES', oss_url: '/images/69c897bd-c33d-4aa8-8d9f-f7418cad7870.jpg' },
        { name: '史迪奇印花帆布托特包', role: 'BAG', oss_url: '/images/52c14f81-8e44-46b1-8926-bde5fb677371.jpg' },
      ],
    },
  ],
  '运动健身': [
    {
      label: '运动活力',
      reason: '浅蓝安德玛运动外套搭配黑色紧身短裤，老爹鞋舒适支撑好，运动风十足',
      score: 83,
      items: [
        { name: '浅蓝安德玛连帽运动外套', role: 'OUTER', oss_url: '/images/69b1416c-2c87-46f4-8119-3d5315ac74d0.jpg' },
        { name: '黑色高腰紧身包臀短裤', role: 'BOTTOM', oss_url: '/images/43f44195-3300-45be-82b6-9323d1680e19.jpg' },
        { name: 'JEEP SPIRIT吉普老爹鞋', role: 'SHOES', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
      ],
    },
    {
      label: '街头运动',
      reason: '深蓝三条杠T恤搭配黄色工装阔腿裤，老爹鞋潮流舒适，出街运动两不误',
      score: 81,
      items: [
        { name: '深蓝色三条杠插肩袖正肩T恤', role: 'TOP', oss_url: '/images/1f433f26-081c-4393-bef9-56e215711e7f.jpg' },
        { name: '多巴胺黄色工装阔腿牛仔裤', role: 'BOTTOM', oss_url: '/images/c8fa1c69-e66b-4421-b851-5dd00017fcbd.jpg' },
        { name: 'JEEP SPIRIT吉普老爹鞋', role: 'SHOES', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
      ],
    },
    {
      label: '休闲运动',
      reason: '白色麻花针织POLO搭配工装微喇牛仔裤，老爹鞋增高舒适，轻松应对轻度运动',
      score: 79,
      items: [
        { name: '白色麻花针织短袖POLO衫', role: 'TOP', oss_url: '/images/e34ad1de-f60b-41ed-bb4a-496f7e311e04.jpg' },
        { name: '卡其色工装微喇牛仔裤', role: 'BOTTOM', oss_url: '/images/706db99c-e3a9-4848-ba05-9297a78e6499.jpg' },
        { name: 'JEEP SPIRIT吉普老爹鞋', role: 'SHOES', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
      ],
    },
  ],
  '朋友聚会': [
    {
      label: '甜辣聚会',
      reason: '黑色格纹假两件POLO搭配荷叶边鱼尾裙，漆皮厚底鞋帅气又甜美',
      score: 86,
      items: [
        { name: '黑色格纹拼接假两件POLO衫', role: 'TOP', oss_url: '/images/38b1b3ab-a5bb-4dfa-a44d-1be9d4ca8fe9.jpg' },
        { name: '黑色荷叶边鱼尾牛仔半身裙', role: 'BOTTOM', oss_url: '/images/4b0b9f66-acbc-45c7-87bc-061e54dfbe77.jpg' },
        { name: '黑色漆皮厚底小皮鞋', role: 'SHOES', oss_url: '/images/72751840-5049-4bb7-bb0e-e56b3ddb15e6.jpg' },
        { name: '浅粉色压花托特包', role: 'BAG', oss_url: '/images/fc1bad1d-a700-4ffa-9dcb-b347c37c68c3.jpg' },
      ],
    },
    {
      label: '温柔聚会',
      reason: '蓝色格纹衬衫搭配粉色微喇休闲裤，米色靴子温柔有型，编织包带来轻松感',
      score: 84,
      items: [
        { name: '蓝白黄格纹宽松长袖衬衫', role: 'TOP', oss_url: '/images/4f089203-8f7e-4d40-b2ad-a6beeb39b6f6.jpg' },
        { name: '粉色高腰微喇休闲裤', role: 'BOTTOM', oss_url: '/images/c9e753cb-59da-4e31-9967-b03aea3eb241.jpg' },
        { name: '米色绒面厚底过膝靴', role: 'SHOES', oss_url: '/images/acc72b19-1e5a-4db4-9dc6-f4af0083ba39.jpg' },
        { name: '米色编织托特包', role: 'BAG', oss_url: '/images/0e70b7f6-76af-4a02-8311-c5e9c9713f35.jpg' },
      ],
    },
    {
      label: '精致聚会',
      reason: '米白改良旗袍连衣裙优雅大方，尖头高跟鞋配菱格纹包，精致又有气质',
      score: 89,
      items: [
        { name: '米白色改良旗袍式鱼尾连衣裙', role: 'DRESS', oss_url: '/images/9bd2835c-2c60-4962-845b-12540d76a4d9.jpg' },
        { name: '米白色尖头细跟高跟鞋', role: 'SHOES', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
        { name: '米白色菱格纹链条腋下包', role: 'BAG', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
        { name: '银镶钻项链手链套装', role: 'ACCESSORY', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
      ],
    },
  ],
}

const savedPlans = reactive(new Map<string, boolean>())

function onSavePlan(key: string) {
  if (savedPlans.has(key)) return
  savedPlans.set(key, true)
  // Find the plan data
  for (const plan of outfits.value) {
    if (plan._key === key) {
      addPlan({
        label: plan.label,
        reason: plan.reason,
        score: plan.score,
        source: 'home',
        items: plan.items.map(i => ({ name: i.name, role: i.role, oss_url: i.oss_url })),
      })
      return
    }
  }
}

const outfits = computed(() => {
  const list = sceneOutfits[currentScene.value] || sceneOutfits['日常休闲']
  return list.slice(0, 2).map((p, i) => ({
    ...p,
    _key: `${currentScene.value}:${i}`,
  }))
})

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

async function onSelectScene(scene: string) {
  chatInput.value = ''
  // User message
  messages.value.push({ type: 'user', text: `帮我搭配一套「${scene}」的穿搭` })
  scrollToBottom()

  // AI thinking phase
  await simulateAiReply(scene, [
    `收到～让我看看衣橱里有什么适合「${scene}」的单品...`,
    '正在分析颜色、风格和季节搭配...',
    `好了！帮你搭了 2 套「${scene}」方案，看看右侧吧 👉`,
  ])

  currentScene.value = scene
  scrollToBottom()
}

async function onSend() {
  const text = chatInput.value.trim()
  if (!text) return

  const matched = matchScene(text)
  messages.value.push({ type: 'user', text })
  chatInput.value = ''
  scrollToBottom()

  await simulateAiReply(matched.scene, [
    '嗯，让我想想...',
    `根据你说的，我来匹配最合适的方案～`,
    matched.reply,
  ])

  currentScene.value = matched.scene
  scrollToBottom()
}

async function simulateAiReply(scene: string, replies: string[]) {
  for (const reply of replies) {
    typing.value = true
    scrollToBottom()
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
    typing.value = false
    messages.value.push({ type: 'ai', text: reply })
    scrollToBottom()
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
  }
}

function matchScene(text: string): { scene: string; reply: string } {
  const kw: Record<string, string[]> = {
    '通勤上班': ['上班', '通勤', '工作', '面试', '开会', '商务', '正式', '职场', '办公室'],
    '约会出行': ['约会', '恋爱', '对象', '男友', '女友', '浪漫', '晚宴', '重要'],
    '运动健身': ['运动', '健身', '跑步', '训练', '户外', '爬山', '徒步', '旅游'],
    '朋友聚会': ['聚会', '朋友', '闺蜜', '派对', '聚餐', '逛街', '下午茶', '拍照'],
    '日常休闲': ['日常', '休闲', '随便', '舒服', '简单', '百搭', '上学', '上课'],
  }
  for (const [scene, words] of Object.entries(kw)) {
    if (words.some(w => text.includes(w))) {
      return { scene, reply: `明白了～帮你搭配了 2 套「${scene}」方案，看右侧 👉` }
    }
  }
  return { scene: '日常休闲', reply: `收到！给你准备了 2 套日常搭配，看看怎么样 👉` }
}
</script>
