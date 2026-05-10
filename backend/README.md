# Dazi 后端

> 搭子 - AI 穿搭助手后端服务

## 技术栈

| 技术 | 用途 |
|------|------|
| NestJS 11 | 后端框架 |
| TypeScript | 开发语言 |
| PostgreSQL + Drizzle ORM | 数据库 |
| 阿里云 OSS | 图片存储 |
| 阿里百炼 (DashScope) | AI 多模态识别 + 文本生成 |
| yt-dlp + ffmpeg | 抖音视频下载与关键帧提取 |

## 快速启动

```bash
cd backend
npm install
npm run start:dev    # 开发模式（热更新）
npm run start:prod   # 生产模式
```

服务默认运行在 `http://localhost:3000`

## 环境变量

复制 `.env.example` 为 `.env`，填入以下配置：

```bash
AI_PROVIDER=alibaba_bailian          # AI 模型：alibaba_bailian | volcano | minimax
ALIBABA_BAILIAN_API_KEY=sk-xxx       # 阿里百炼 API Key
DATABASE_URL=postgresql://...        # PostgreSQL 连接串
OSS_REGION=oss-cn-shenzhen           # 阿里云 OSS 区域
OSS_ACCESS_KEY_ID=xxx               # OSS AccessKey ID
OSS_ACCESS_KEY_SECRET=xxx           # OSS AccessKey Secret
OSS_BUCKET=dy-2026                  # OSS Bucket 名称
PORT=3000                           # 服务端口
```

## 目录结构

```
backend/src/
├── main.ts                          # 入口，CORS 配置
├── app.module.ts                    # 根模块，注册所有子模块
├── common/
│   ├── db/
│   │   ├── schema.ts                # Drizzle 表定义 (clothes / outfits / scenes)
│   │   └── database.module.ts       # PostgreSQL 连接全局模块
│   └── services/
│       ├── oss.service.ts           # 阿里云 OSS 上传（upload / uploadFromBase64）
│       └── ai/
│           ├── ai.interface.ts      # IAiProvider 统一接口
│           ├── ai.module.ts         # 按 AI_PROVIDER 环境变量动态注入 provider
│           └── alibaba-bailian.provider.ts  # 阿里百炼实现
├── scenes/                          # 场景模块
├── wardrobe/                        # 衣橱模块
├── recognize/                       # 图片识别模块
├── outfit/                          # 搭配推荐 + 评价模块
└── video/                           # 抖音视频解析模块
```

## API 接口

### 场景

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/scenes | 获取预置场景列表（通勤/约会/运动/休闲/聚会） |

### 衣橱

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/wardrobe | 获取衣橱列表，支持 ?category=&style=&season= 筛选 |
| GET | /api/wardrobe/:id | 获取单件衣物详情 |
| POST | /api/wardrobe | 添加衣物 |
| PUT | /api/wardrobe/:id | 编辑衣物元信息（name/category/color/style/season） |

### 图片识别

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/recognize | multipart/form-data 上传图片，AI 识别衣物信息 |

### 搭配

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/outfit/recommend | `{ scene: string }` → AI 从衣橱推荐搭配方案 |
| POST | /api/outfit/evaluate | `{ items: number[] }` → AI 对自选搭配评分+建议 |

### 视频解析

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/video/parse | `{ url: string }` → yt-dlp 下载 + ffmpeg 取帧 + AI 识别 |
| POST | /api/video/save | `{ items: [...] }` → 图片上传 OSS + 写入数据库 |

## 数据库表

- **clothes** — 衣物表（id, name, category, color, style, season, oss_url, source, taobao_url, created_at）
- **outfits** — 搭配方案表（id, scene, items JSONB, score, reason, is_custom, created_at）
- **scenes** — 场景预置表（id, name, icon, description）

枚举值：
- category: `top` / `bottom` / `dress` / `shoes` / `bag` / `accessory`
- color: `black` / `white` / `red` / `blue` / `green` / `yellow` / `pink` / `gray` / `brown` / `beige` / `multi`
- style: `casual` / `formal` / `sport` / `sweet` / `street` / `minimal`
- season: `spring` / `summer` / `autumn` / `winter` / `all`
- source: `upload` / `video` / `taobao`

## AI 多模型切换

通过 `AI_PROVIDER` 环境变量切换，业务代码不感知具体实现。统一接口见 `ai.interface.ts`：

```typescript
interface IAiProvider {
  recognizeClothing(imageBase64: string): Promise<ClothingInfo>;
  recommendOutfit(clothes[], scene: string): Promise<OutfitPlan[]>;
  evaluateOutfit(clothes[]): Promise<Evaluation>;
}
```

当前已实现：阿里百炼（qwen-vl-max 图片识别 + qwen-max 文本生成）。

## 关键依赖

- `execa@8` — 调用 yt-dlp / ffmpeg 命令行工具（需预先安装）
- `openai` SDK — 阿里百炼兼容 OpenAI 格式，用此 SDK 调用
- `ali-oss` — 阿里云 OSS Node.js SDK

## 前端联调

CORS 已开启，允许 `http://localhost:5173`（Vite dev server 默认端口）。
前端通过 `VITE_API_BASE_URL=http://localhost:3000/api` 访问后端。
