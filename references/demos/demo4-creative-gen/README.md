# Demo 4：创意内容生成

> 输入图片或文字描述，AI 一键生成小红书/科普/推荐/攻略文案。

## 功能

支持 4 种内容风格：

| 风格 | 说明 |
| --- | --- |
| 小红书 | 小红书博主风格，emoji 装饰，互动感强 |
| 科普 | 科普作者风格，通俗易懂，有趣味性 |
| 推荐 | 生活达人风格，推荐相关好物 |
| 攻略 | 旅行攻略风格，实用简洁 |

两种输入方式：
- **文字描述** — 输入场景描述、视频内容等文字
- **上传图片** — 先用 qwen-vl-max 分析图片，再生成内容

## 项目结构

```text
demo4-creative-gen/
├── server/
│   ├── index.ts                   # 启动入口，端口 3104
│   ├── routes.ts                  # API 路由
│   ├── types.ts                   # 类型定义
│   └── services/
│       ├── contentGenerator.ts    # 内容生成（qwen-plus）
│       └── imageAnalyzer.ts       # 图片分析（qwen-vl-max）
├── client/
│   ├── index.html
│   ├── vite.config.ts             # 代理 /api → 3104
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       └── style.css
├── package.json
└── tsconfig.json
```

## 环境变量

```bash
DASHSCOPE_API_KEY=sk-xxx
```

## 启动

```bash
cd demos/demo4-creative-gen
pnpm install
pnpm dev:server   # 后端 3104
pnpm dev:client   # 前端 5176
# 浏览器打开 http://localhost:5176
```

## API 文档

### POST /api/generate/text

文字输入生成内容。

```json
// Request
{ "text": "上海南京路的一家老字号生煎店", "style": "xiaohongshu" }

// Response
{ "taskId": "a1b2c3d4", "status": "processing" }
```

### POST /api/generate/image

图片输入生成内容。multipart/form-data，字段：`image`（文件）、`style`（风格）。

### GET /api/generate/:taskId

查询生成结果。

```json
{
  "id": "a1b2c3d4",
  "status": "done",
  "style": "xiaohongshu",
  "content": "「救命！南京路这碗生煎让我连蹲3天门口排队！！」..."
}
```

## AI 模型

| 用途 | 模型 |
| --- | --- |
| 内容生成 | qwen-plus |
| 图片分析 | qwen-vl-max（仅图片模式） |

## 技术栈

| 组件 | 方案 |
| --- | --- |
| 后端 | Hono + @hono/node-server |
| 前端 | Vue 3 + Vite |
| AI 调用 | openai SDK（DashScope 兼容接口） |
