# Demo 3：视频内容摘要

> 输入音频文件，AI 自动转写并生成结构化内容摘要。赛道三"内容理解→重组"的核心能力。

## 功能

1. **音频转写** — 使用阿里云百炼 `qwen3-asr-flash` 模型，支持中英文音频转文字
2. **结构化摘要** — 使用 `qwen-plus` 模型，输出视频摘要、时间线分段、关键信息点、话题标签

## 项目结构

```text
demo3-video-summary/
├── server/                        # 后端 (Hono)
│   ├── index.ts                   # 启动入口，端口 3103
│   ├── routes.ts                  # API 路由
│   ├── types.ts                   # 类型定义
│   └── services/
│       ├── transcriber.ts         # 音频转写（qwen3-asr-flash）
│       └── summarizer.ts          # 内容摘要（qwen-plus）
├── client/                        # 前端 (Vue 3 + Vite)
│   ├── index.html
│   ├── vite.config.ts             # 代理 /api → 3103
│   └── src/
│       ├── App.vue                # 主界面
│       ├── main.ts
│       └── style.css
├── output/                        # 运行时产出（已 gitignore）
├── package.json
└── tsconfig.json
```

## 环境变量

需要在项目根目录 `.env` 中配置：

```bash
DASHSCOPE_API_KEY=sk-xxx
```

## 启动

```bash
cd demos/demo3-video-summary
pnpm install
pnpm dev:server   # 后端 3103
pnpm dev:client   # 前端 5175
# 浏览器打开 http://localhost:5175
```

## API 文档

### POST /api/summary

上传音频文件并触发分析。

```bash
curl -X POST http://localhost:3103/api/summary \
  -F "audio=@audio.mp3"

# Response
{ "taskId": "a1b2c3d4", "status": "processing" }
```

### GET /api/summary/:taskId

查询分析结果。

```json
{
  "id": "a1b2c3d4",
  "status": "done",
  "transcript": [
    { "start": 0, "end": 5, "text": "大家好，欢迎来到今天的视频。" },
    { "start": 5, "end": 10, "text": "今天我们要介绍上海的特色美食。" }
  ],
  "fullText": "大家好，欢迎来到今天的视频。今天我们要介绍...",
  "summary": {
    "summary": "本视频介绍了上海的特色美食，包括南京路步行街的老字号小吃、经典生煎包的特点。",
    "segments": [
      {
        "time": "0-15s",
        "topic": "视频开场与主题引入",
        "key_points": ["主持人问候并欢迎观众", "明确本期主题为上海特色美食"]
      }
    ],
    "tags": ["上海美食", "生煎包", "本帮菜", "南京路步行街"]
  }
}
```

## AI 模型

| 步骤 | 模型 | 说明 |
| --- | --- | --- |
| 音频转写 | qwen3-asr-flash | DashScope 多模态 ASR，通过 base64 内联传输音频 |
| 内容摘要 | qwen-plus | 文本大模型，基于转录文本生成结构化摘要 |

## 技术栈

| 组件 | 方案 |
| --- | --- |
| 后端 | Hono + @hono/node-server |
| 前端 | Vue 3 + Vite |
| AI 调用 | openai SDK + fetch（DashScope 多模态接口） |
