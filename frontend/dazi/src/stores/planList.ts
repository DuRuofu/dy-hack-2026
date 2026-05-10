import { reactive } from 'vue'

export interface PlanItem {
  label: string
  reason: string
  score: number
  source: 'preset' | 'home' | 'video'
  items: { name: string; role: string; oss_url: string }[]
}

export const planList = reactive<PlanItem[]>([
  {
    label: '通勤轻商务',
    reason: '蓝色格纹三件套利落干练，尖头细高跟拉长线条，菱格纹腋下包增添精致感',
    score: 92, source: 'preset',
    items: [
      { name: '蓝色格纹三件套西装套装', role: 'OUTER', oss_url: '/images/548443f8-777e-4c95-9b1a-8c3ef2eac632.jpg' },
      { name: '米白色尖头细跟高跟鞋', role: 'SHOES', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
      { name: '米白色菱格纹链条腋下包', role: 'BAG', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
    ],
  },
  {
    label: '周末Citywalk',
    reason: '灰色三条杠T恤搭配扎染阔腿牛仔裤，匡威帆布鞋和猫咪印花托特包，松弛有个性',
    score: 87, source: 'preset',
    items: [
      { name: '浅灰色三条杠拼接圆领短袖T恤', role: 'TOP', oss_url: '/images/8e39687a-5606-4aea-93fa-7bfbb0a68c28.jpg' },
      { name: '黑灰色扎染阔腿牛仔裤', role: 'BOTTOM', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
      { name: '匡威1970s黑色低帮帆布鞋', role: 'SHOES', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
      { name: '黑色猫咪印花帆布托特包', role: 'BAG', oss_url: '/images/585c072a-08bd-4c77-9db8-1256b9c3e5ac.jpg' },
    ],
  },
  {
    label: '约会晚宴',
    reason: '米白蕾丝连衣裙温柔浪漫，珍珠蝴蝶结高跟鞋和红色迷你包点亮造型',
    score: 90, source: 'preset',
    items: [
      { name: '米白色方领泡泡袖蕾丝中长连衣裙', role: 'DRESS', oss_url: '/images/ec2b8f27-e9d2-4613-a388-d042ab570c3b.jpg' },
      { name: '米白色珍珠蝴蝶结尖头高跟鞋', role: 'SHOES', oss_url: '/images/ab72df95-b540-424e-bc8a-f39e56cf80cf.jpg' },
      { name: '红色亮面迷你手提斜挎包', role: 'BAG', oss_url: '/images/a9aee286-a7b1-4211-a5d9-7fb908532e1b.jpg' },
      { name: '银镶钻项链手链套装', role: 'ACCESSORY', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
    ],
  },
  {
    label: '甜酷聚会',
    reason: '黑色格纹假两件POLO搭配荷叶边鱼尾裙，漆皮厚底鞋帅气又甜美',
    score: 86, source: 'preset',
    items: [
      { name: '黑色格纹拼接假两件POLO衫', role: 'TOP', oss_url: '/images/38b1b3ab-a5bb-4dfa-a44d-1be9d4ca8fe9.jpg' },
      { name: '黑色荷叶边鱼尾牛仔半身裙', role: 'BOTTOM', oss_url: '/images/4b0b9f66-acbc-45c7-87bc-061e54dfbe77.jpg' },
      { name: '黑色漆皮厚底小皮鞋', role: 'SHOES', oss_url: '/images/72751840-5049-4bb7-bb0e-e56b3ddb15e6.jpg' },
      { name: '浅粉色压花托特包', role: 'BAG', oss_url: '/images/fc1bad1d-a700-4ffa-9dcb-b347c37c68c3.jpg' },
    ],
  },
  {
    label: '优雅旗袍风',
    reason: '米白改良旗袍连衣裙优雅大方，尖头高跟鞋配菱格纹包，精致有气质',
    score: 89, source: 'preset',
    items: [
      { name: '米白色改良旗袍式鱼尾连衣裙', role: 'DRESS', oss_url: '/images/9bd2835c-2c60-4962-845b-12540d76a4d9.jpg' },
      { name: '米白色尖头细跟高跟鞋', role: 'SHOES', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
      { name: '米白色菱格纹链条腋下包', role: 'BAG', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
      { name: '银镶钻项链手链套装', role: 'ACCESSORY', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
    ],
  },
])

export function addPlan(plan: PlanItem) {
  // Avoid duplicates by label
  if (!planList.some(p => p.label === plan.label)) {
    planList.unshift(plan)
  }
}

export function removePlan(index: number) {
  planList.splice(index, 1)
}
