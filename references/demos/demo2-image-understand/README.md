# Demo 2：图片多模态理解

> 上传图片，AI 自动识别场景、物体、文字，并分析情绪和标签。

## 功能

上传一张图片，AI 返回结构化分析结果：

1. **场景识别** — 一句话概括画面场景
2. **物体检测** — 列出画面中的主要物体/人物
3. **OCR 文字提取** — 识别图片中的文字内容
4. **情绪分析** — 判断画面的情绪/氛围
5. **标签生成** — 自动生成 3-5 个描述标签

## 项目结构

```text
demo2-image-understand/
├── server/                        # 后端 (Hono)
│   ├── index.ts                   # 启动入口，端口 3102
│   ├── routes.ts                  # API 路由
│   ├── types.ts                   # 类型定义
│   └── services/
│       └── imageAnalyzer.ts       # 核心分析逻辑
├── client/                        # 前端 (Vue 3 + Vite)
│   ├── index.html
│   ├── vite.config.ts             # 代理 /api → 3102
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

使用阿里云百炼平台的 `qwen-vl-max` 多模态模型。

## 启动

```bash
# 进入本目录
cd demos/demo2-image-understand

# 安装依赖
pnpm install

# 启动后端（端口 3102）
pnpm dev:server

# 新开终端，启动前端（端口 5174）
pnpm dev:client

# 浏览器打开 http://localhost:5174
```

## API 文档

### POST /api/analyze

上传图片并触发分析。

```bash
curl -X POST http://localhost:3102/api/analyze \
  -F "image=@photo.jpg"

# Response
{ "taskId": "a1b2c3d4", "status": "processing" }
```

### GET /api/analyze/:taskId

查询分析结果。

```json
// Response (done)
{
  "id": "a1b2c3d4",
  "status": "done",
  "result": {
    "scene": "一只狐狸在干燥的荒野地面上行走。",
    "objects": ["狐狸"],
    "text_ocr": "",
    "mood": "宁静而自然",
    "tags": ["野生动物", "狐狸", "荒野", "自然环境", "行走"]
  }
}
```

### GET /api/image/:taskId

获取上传的原图。

## 技术栈

| 组件 | 方案 |
| --- | --- |
| 后端 | Hono + @hono/node-server |
| 前端 | Vue 3 + Vite |
| AI 模型 | 阿里云百炼 qwen-vl-max（多模态视觉理解） |
| API 调用 | openai SDK（DashScope 兼容接口） |
