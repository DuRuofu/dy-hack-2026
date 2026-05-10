# video-extract — 抖音视频 → 衣物单品提取

验证 yt-dlp 下载视频 + ffmpeg 抽帧 + DashScope 多模态识别的完整链路。

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 DashScope API Key

# 3. 启动
pnpm dev

# 4. 浏览器打开 http://localhost:5173
#    粘贴抖音视频链接，点击"开始验证"
```

## 前置依赖

```bash
# macOS
brew install ffmpeg yt-dlp
```

## 验证链路

```
抖音视频链接
  → yt-dlp 获取元信息
  → yt-dlp 下载视频 (MP4)
  → ffmpeg 按间隔抽帧 (JPG)
  → DashScope qwen-vl-max 逐帧识别衣物
  → 输出结构化 JSON (类别/颜色/风格/季节)
```
