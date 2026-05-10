# Demo 5 — 视频问答

输入视频链接，AI 自动提取关键帧和音频转录，然后对视频内容进行多轮问答。

## 功能

- 支持 YouTube / B站 / 抖音等视频链接
- 自动下载视频、按间隔抽取关键帧
- 自动提取音频并进行语音转录（DashScope ASR）
- 基于关键帧 + 转录文本的多模态视频问答（qwen-vl-max）
- 支持多轮对话，保留上下文
- 实时调试日志面板，展示 AI 通信细节
- 亮色 / 暗色主题切换

## 技术栈

| 层 | 方案 |
|---|---|
| 后端 | Hono + @hono/node-server |
| 前端 | Vue 3 + Vite |
| 视频处理 | yt-dlp + fluent-ffmpeg |
| AI 问答 | qwen-vl-max（通义千问视觉语言模型） |
| 语音转录 | qwen3-asr-flash（DashScope 多模态 ASR） |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动后端（端口 3105）
pnpm dev:server

# 启动前端（端口 5177）
pnpm dev:client

# 浏览器打开 http://localhost:5177
```

## 环境变量

在项目根目录 `.env` 中配置：

```
DASHSCOPE_API_KEY=your-api-key
```

## API

```
POST /api/session
  Body: { "url": "https://..." }
  Response: { "sessionId": "xxx", "status": "loading" }

GET /api/session/:sessionId
  Response: { id, status, videoTitle, framesCount, transcriptLength, messages, debugLog }

POST /api/session/:sessionId/ask
  Body: { "question": "..." }
  Response: { "answer": "..." }

GET /api/frames/:sessionId/:filename
  Response: image/jpeg

GET /api/status
  Response: { "ok": true, "sessions": 0 }
```

## 工作流程

1. 用户提交视频链接 → 后台异步下载视频
2. 并行执行：按每 10 秒抽取关键帧 + 提取音频并转录
3. 处理完成后状态变为 `ready`，用户可以开始提问
4. 每次提问时，选取最多 8 帧关键帧 + 转录文本 + 问题，发送给 qwen-vl-max
5. 支持多轮对话，历史消息会一并发送以保持上下文
