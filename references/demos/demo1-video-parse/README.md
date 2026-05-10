# Demo 1：视频链接解析 + 关键帧提取

> 基础能力模块。后续所有 Demo 都依赖它的输出。

## 功能

输入一个视频链接（YouTube / B站 / 抖音），自动完成：

1. 解析视频元信息（标题、作者、时长、描述）
2. 下载视频文件
3. 按固定间隔抽取关键帧（默认每 5 秒一帧）
4. 提取音频（MP3）

## 项目结构

```text
demo1-video-parse/
├── server/                        # 后端 (Hono)
│   ├── index.ts                   # 启动入口，端口 3101
│   ├── routes.ts                  # API 路由
│   ├── types.ts                   # 类型定义
│   └── services/
│       └── videoParser.ts         # 核心解析逻辑
├── client/                        # 前端 (Vue 3 + Vite)
│   ├── index.html
│   ├── vite.config.ts             # 代理 /api → 3101
│   └── src/
│       ├── App.vue                # 主界面
│       ├── main.ts
│       └── style.css
├── output/                        # 运行时产出（已 gitignore）
├── package.json
└── tsconfig.json
```

## 前置依赖

系统需要安装以下工具：

```bash
# macOS
brew install ffmpeg yt-dlp
```

## 启动

```bash
# 进入本目录
cd demos/demo1-video-parse

# 安装依赖
pnpm install

# 启动后端（端口 3101）
pnpm dev:server

# 新开终端，启动前端（端口 5173）



# 浏览器打开 http://localhost:5173
```

## API 文档

### POST /api/parse

触发视频解析。

```json
// Request
{ "url": "https://www.youtube.com/watch?v=xxx" }

// Response
{ "taskId": "a1b2c3d4", "status": "processing" }
```

### GET /api/parse/:taskId

查询解析结果。解析完成后返回完整数据。

```json
// Response (done)
{
  "id": "a1b2c3d4",
  "url": "https://...",
  "status": "done",
  "result": {
    "taskId": "a1b2c3d4",
    "meta": {
      "title": "视频标题",
      "description": "...",
      "duration": 120,
      "uploader": "作者",
      "thumbnail": "https://...",
      "url": "https://..."
    },
    "frames": ["frame_0001.jpg", "frame_0002.jpg", ...],
    "audio": "audio.mp3",
    "outputDir": "/path/to/output/a1b2c3d4"
  }
}
```

### GET /api/frames/:taskId/:filename

获取指定帧图片。

### GET /api/audio/:taskId

获取音频文件。

## 输出目录

运行后会在 `output/<taskId>/` 下生成：

```text
output/a1b2c3d4/
├── video.mp4              # 原始视频
├── audio.mp3              # 提取的音频
└── frames/
    ├── frame_0001.jpg     # 关键帧
    ├── frame_0002.jpg
    └── ...
```

## 技术栈

| 组件 | 方案 |
| --- | --- |
| 后端 | Hono + @hono/node-server |
| 前端 | Vue 3 + Vite |
| 视频解析 | execa → 调用系统 yt-dlp |
| 视频处理 | fluent-ffmpeg |
