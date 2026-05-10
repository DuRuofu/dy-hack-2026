import type { PlanItem } from './planList'

export interface VideoSource {
  urlPattern: string
  platform: 'douyin' | 'bilibili'
  title: string
  outfits: PlanItem[]
}

// Helper: DB clothing items keyed by id for easy lookup
const C: Record<number, { name: string; oss_url: string }> = {
  52: { name: '蓝白黄格纹宽松长袖衬衫', oss_url: '/images/4f089203-8f7e-4d40-b2ad-a6beeb39b6f6.jpg' },
  55: { name: '浅蓝色立体花朵装饰阔腿牛仔七分裤', oss_url: '/images/7a992a43-ecab-4d6a-a688-68d22795c570.jpg' },
  3:  { name: '黑色格纹拼接假两件POLO衫', oss_url: '/images/38b1b3ab-a5bb-4dfa-a44d-1be9d4ca8fe9.jpg' },
  12: { name: '黑色不规则开叉A字半身裙', oss_url: '/images/f0f2faa2-1765-4d99-8d09-30eb32e9fbb3.jpg' },
  23: { name: '白色撞色猫爪印花短袖 T 恤', oss_url: '/images/d7c3df32-87ce-471a-921c-0d064b7ed3b9.jpg' },
  24: { name: '粉色高腰微喇休闲裤', oss_url: '/images/c9e753cb-59da-4e31-9967-b03aea3eb241.jpg' },
  17: { name: '白色V领不规则褶皱短袖T恤', oss_url: '/images/6f2fa181-4bb1-45c5-8635-baa86e65d2e4.jpg' },
  14: { name: '黑色荷叶边鱼尾牛仔半身裙', oss_url: '/images/4b0b9f66-acbc-45c7-87bc-061e54dfbe77.jpg' },
  6:  { name: '黑灰色扎染阔腿牛仔裤', oss_url: '/images/ea13776a-7c1c-4df7-904d-fbaa83cb8866.jpg' },
  44: { name: '学院风假两件格纹连衣裙', oss_url: '/images/785068a3-7395-4e2c-9669-76930606e3e4.jpg' },
  28: { name: '米白色方领泡泡袖蕾丝中长连衣裙', oss_url: '/images/ec2b8f27-e9d2-4613-a388-d042ab570c3b.jpg' },
  2:  { name: '蓝色针织拼接白色网纱鱼尾长裙', oss_url: '/images/c70754b3-be34-49d8-85e6-157e4de70c20.jpg' },
  43: { name: '米白色改良旗袍式鱼尾连衣裙', oss_url: '/images/9bd2835c-2c60-4962-845b-12540d76a4d9.jpg' },
  16: { name: '浅灰色三条杠拼接圆领短袖T恤', oss_url: '/images/8e39687a-5606-4aea-93fa-7bfbb0a68c28.jpg' },
  5:  { name: '黑色蕾丝拼接蝴蝶结印花阔腿裤', oss_url: '/images/77c6866e-787f-47f0-bfc2-3d8a71473356.jpg' },
  4:  { name: '白色麻花针织短袖POLO衫', oss_url: '/images/e34ad1de-f60b-41ed-bb4a-496f7e311e04.jpg' },
  11: { name: '黑色高腰紧身包臀短裤', oss_url: '/images/43f44195-3300-45be-82b6-9323d1680e19.jpg' },
  8:  { name: '卡其色工装微喇牛仔裤', oss_url: '/images/706db99c-e3a9-4848-ba05-9297a78e6499.jpg' },
  19: { name: '匡威1970s黑色低帮帆布鞋', oss_url: '/images/e1ff6a36-c98e-4871-b647-92969b85f589.jpg' },
  20: { name: 'JEEP SPIRIT吉普老爹鞋', oss_url: '/images/12df59cf-6e51-40b3-aed3-68aa8f90a61e.jpg' },
  22: { name: '黑色漆皮厚底小皮鞋', oss_url: '/images/72751840-5049-4bb7-bb0e-e56b3ddb15e6.jpg' },
  51: { name: '红色三道杠厚底休闲板鞋', oss_url: '/images/69c897bd-c33d-4aa8-8d9f-f7418cad7870.jpg' },
  37: { name: '史迪奇印花帆布托特包', oss_url: '/images/52c14f81-8e44-46b1-8926-bde5fb677371.jpg' },
  38: { name: '黑色猫咪印花帆布托特包', oss_url: '/images/585c072a-08bd-4c77-9db8-1256b9c3e5ac.jpg' },
  31: { name: '红色亮面迷你手提斜挎包', oss_url: '/images/a9aee286-a7b1-4211-a5d9-7fb908532e1b.jpg' },
  42: { name: '米色编织托特包', oss_url: '/images/0e70b7f6-76af-4a02-8311-c5e9c9713f35.jpg' },
  34: { name: '银镶钻项链手链套装', oss_url: '/images/9f75b755-5904-481f-a67b-f8ff321530e4.jpg' },
  25: { name: '酒红色 COLORADO 刺绣棒球帽', oss_url: '/images/0dc8bb3f-b0d4-41f9-a763-453d3dc03eef.jpg' },
  10: { name: '多巴胺黄色工装阔腿牛仔裤', oss_url: '/images/c8fa1c69-e66b-4421-b851-5dd00017fcbd.jpg' },
  29: { name: '藏青色翻领短袖拼接中长连衣裙', oss_url: '/images/0d26e242-1d85-4193-acf7-4b123fc68614.jpg' },
  32: { name: '米白色菱格纹链条腋下包', oss_url: '/images/c629b743-270a-4ee3-8640-eddaade2bdaa.jpg' },
  49: { name: '米白色尖头细跟高跟鞋', oss_url: '/images/3660e302-146f-44ff-a47c-1f8535ebe272.jpg' },
  48: { name: '黑色方框太阳镜', oss_url: '/images/1fcf6f94-3cbb-46f2-991a-df9aa798713e.jpg' },
  18: { name: '深蓝色三条杠插肩袖正肩T恤', oss_url: '/images/1f433f26-081c-4393-bef9-56e215711e7f.jpg' },
}

function outfit(items: { id: number; role: string }[], label: string, reason: string, score?: number): PlanItem {
  return {
    label,
    reason,
    score: score ?? (80 + Math.floor(Math.random() * 12)),
    source: 'video' as const,
    items: items.map(i => ({ name: C[i.id].name, role: i.role, oss_url: C[i.id].oss_url })),
  }
}

// Known video sources — matched by URL substring
export const videoSources: VideoSource[] = [
  {
    urlPattern: 'OUH7xceVI9s',
    platform: 'douyin',
    title: '平价又美丽的韩系少女穿搭！',
    outfits: [
      outfit([{id:52,role:'TOP'},{id:55,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭1：蓝白格+阔腿裤', '蓝白格小飞袖T恤搭配浅蓝色牛仔阔腿裤，清新又显腿长，老爹鞋舒适百搭'),
      outfit([{id:4,role:'TOP'},{id:12,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭2：学院风+黑A字裙', '学院风V领针织马甲搭配黑色A字裙，厚底小皮鞋延续学院感，甜酷平衡'),
      outfit([{id:17,role:'TOP'},{id:14,role:'BOTTOM'},{id:49,role:'SHOES'}], '穿搭3：飘带衬衫+百褶裙', '灰蓝色荡领飘带衬衫搭配百褶半身裙，尖头高跟鞋增添优雅气质'),
      outfit([{id:23,role:'TOP'},{id:12,role:'BOTTOM'},{id:19,role:'SHOES'},{id:37,role:'BAG'}], '穿搭4：粉色条纹+百褶裙', '粉色条纹短袖衬衫搭配灰色西装百褶裙，帆布鞋和托特包休闲出街'),
      outfit([{id:23,role:'TOP'},{id:12,role:'BOTTOM'},{id:22,role:'SHOES'},{id:32,role:'BAG'}], '穿搭5：白衬衫+灰A字裙', '经典白衬衫配灰色A字裙，漆皮小皮鞋和菱格包提升精致度'),
      outfit([{id:17,role:'TOP'},{id:14,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭6：粉色长袖+棕百褶', '粉色假两件长袖衬衫配棕色百褶裙，温柔甜美约会穿搭'),
      outfit([{id:23,role:'TOP'},{id:24,role:'BOTTOM'},{id:20,role:'SHOES'},{id:42,role:'BAG'}], '穿搭7：防晒外套+工装裤', '白色防晒外套配粉色工装速干裤，老爹鞋和编织包度假氛围感'),
    ],
  },
  {
    urlPattern: 'C9Wl1gpkDtw',
    platform: 'douyin',
    title: '7套日常又美丽的韩系小套装',
    outfits: [
      outfit([{id:16,role:'TOP'},{id:24,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭1：灰扭结T+白色裤子', '灰色扭结T恤搭配小白裤，简约清爽凸显腰线，老爹鞋舒适增高'),
      outfit([{id:4,role:'TOP'},{id:23,role:'TOP'},{id:11,role:'BOTTOM'},{id:19,role:'SHOES'}], '穿搭2：刺绣衬衫+黑短裤', '刺绣镂空亚麻衬衫内搭白色打底，配黑色牛仔短裤，帆布鞋清爽出行'),
      outfit([{id:3,role:'TOP'},{id:5,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭3：格纹背心+碎花裤', '不规则蛋糕裙摆格纹小背心配碎花阔腿裤，漆皮鞋增添甜美感'),
      outfit([{id:23,role:'TOP'},{id:12,role:'BOTTOM'},{id:19,role:'SHOES'},{id:31,role:'BAG'}], '穿搭4：红白罩衫+短裙', '红白配色罩衫配短裙，红色迷你包和帆布鞋色彩呼应，活力满满'),
      outfit([{id:23,role:'TOP'},{id:11,role:'BOTTOM'},{id:34,role:'ACCESSORY'},{id:38,role:'BAG'}], '穿搭5：树莓粉T+牛仔中裤', '树莓粉纯棉T恤配牛仔短中裤，粉色丝巾腰带和白色帆布包甜美点缀'),
      outfit([{id:17,role:'TOP'},{id:11,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭6：挂脖衬衫+深蓝短裤', '挂脖衬衫设计感十足，配深蓝色牛仔短裤，漆皮鞋完成造型'),
      outfit([{id:17,role:'TOP'},{id:12,role:'BOTTOM'},{id:49,role:'SHOES'}], '穿搭7：露肩衬衫+蛋糕裙', '露肩粉色衬衫配白色蛋糕短裙，尖头高跟鞋甜美又显气质'),
    ],
  },
  {
    urlPattern: 'MIshcfIjmZU',
    platform: 'douyin',
    title: '日常美丽又适合度假的韩系小套装',
    outfits: [
      outfit([{id:52,role:'TOP'},{id:12,role:'BOTTOM'},{id:49,role:'SHOES'}], '穿搭1：娃娃领衬衫+蛋糕裙', '蓝色娃娃领小飞袖衬衫配白色蛋糕裙，尖头高跟鞋清新甜美'),
      outfit([{id:4,role:'TOP'},{id:14,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭2：镂空上衣+碎花裙', '镂空假两件上衣配灰蓝色碎花半身裙，漆皮鞋增添精致感'),
      outfit([{id:3,role:'TOP'},{id:6,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭3：黑白两件套+阔腿裤', '黑白色长袖两件套衬衫配黑色阔腿牛仔裤，老爹鞋街头休闲'),
      outfit([{id:17,role:'TOP'},{id:2,role:'DRESS'},{id:49,role:'SHOES'}], '穿搭4：镂空上衣+格纹长裙', '花边镂空长袖上衣配蓝色格纹长裙，尖头高跟鞋优雅大方'),
      outfit([{id:28,role:'DRESS'},{id:49,role:'SHOES'},{id:32,role:'BAG'}], '穿搭5：樱花粉连衣裙', '樱花粉连衣裙温柔浪漫，尖头高跟鞋和菱格包完成约会造型'),
      outfit([{id:17,role:'TOP'},{id:12,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭6：韩系波点+百褶裙', '韩系波点短袖配白色百褶裙，漆皮鞋甜美学院风'),
      outfit([{id:18,role:'TOP'},{id:6,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭7：条纹针织+阔腿裤', '条纹斜肩针织衫配阔腿牛仔裤，老爹鞋休闲又时髦'),
    ],
  },
  {
    urlPattern: 'BV1wDJZzPEta',
    platform: 'bilibili',
    title: '155～日常又美丽的韩系穿搭！降温啦！',
    outfits: [
      outfit([{id:23,role:'TOP'},{id:17,role:'TOP'},{id:8,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭1：吊带+外搭+阔腿裤', '白色吊带配韩系肉色外搭和暖棕色阔腿裤，老爹鞋慵懒韩范'),
      outfit([{id:52,role:'TOP'},{id:12,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭2：棒球服+JK百褶裙', '棒球服夹克外套配JK百褶裙，漆皮小皮鞋学院风满满'),
      outfit([{id:4,role:'TOP'},{id:6,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭3：短卫衣+阔腿牛仔裤', '薄绒短卫衣配阔腿牛仔裤，老爹鞋休闲舒适，显高显瘦'),
      outfit([{id:18,role:'TOP'},{id:8,role:'BOTTOM'},{id:49,role:'SHOES'},{id:32,role:'BAG'}], '穿搭4：修身针织+卡其裤', '普蓝色修身针织衫配卡其色阔腿裤，尖头高跟鞋和菱格包精致通勤'),
    ],
  },
  {
    urlPattern: 'BV1UgYDzWEvz',
    platform: 'bilibili',
    title: '秋冬韩系穿搭来啦 期待秋天！',
    outfits: [
      outfit([{id:52,role:'TOP'},{id:4,role:'TOP'},{id:6,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭1：娃娃领+毛衣坎肩', '娃娃领衬衫叠穿毛衣坎肩配阔腿裤，老爹鞋韩系层次感穿搭'),
      outfit([{id:4,role:'TOP'},{id:24,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭2：粉色毛衣+短裙', '粉色毛衣配灰粉色短裙，漆皮小皮鞋甜美温柔'),
      outfit([{id:3,role:'TOP'},{id:12,role:'BOTTOM'},{id:22,role:'SHOES'}], '穿搭3：波点上衣+蛋糕裙', '黑白波点上衣配黑色蛋糕裙，漆皮鞋复古甜美'),
      outfit([{id:3,role:'TOP'},{id:23,role:'TOP'},{id:12,role:'BOTTOM'},{id:19,role:'SHOES'}], '穿搭4：假两件+白色半裙', '黑白假两件上衣配白色半身裙，帆布鞋清爽休闲'),
      outfit([{id:52,role:'TOP'},{id:24,role:'BOTTOM'},{id:20,role:'SHOES'}], '穿搭5：绿色格子衬衫+白裤', '绿色格子衬衫配白色阔腿裤，老爹鞋清新田园风'),
      outfit([{id:52,role:'TOP'},{id:24,role:'BOTTOM'},{id:51,role:'SHOES'}], '穿搭6：橙色格子衬衫+白裤', '橙色格子衬衫配白色阔腿裤，红色板鞋点亮整体造型'),
    ],
  },
]

export function findVideoSource(url: string): VideoSource | null {
  for (const src of videoSources) {
    if (url.includes(src.urlPattern)) return src
  }
  return null
}

export function detectPlatform(url: string): 'douyin' | 'bilibili' | 'unknown' {
  if (/bilibili\.com|b23\.tv|BV[\w]+/i.test(url)) return 'bilibili'
  if (/douyin\.com|v\.douyin\.com|tiktok\.com/i.test(url)) return 'douyin'
  return 'unknown'
}
