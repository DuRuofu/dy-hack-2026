# 搭子 — AI 穿搭助手

> 抖音黑客松 2026 · 赛道一：视觉搜索

"搭子"是一款 AI 穿搭助手。用户拍摄或上传穿搭照片，AI 理解服装风格、颜色、场景，从多来源衣物库中智能推荐搭配方案。

## 衣物来源

搭子的衣物库由三个渠道构建：

1. **抖音穿搭视频提取** — 通过分析抖音穿搭博主的视频内容，自动识别并提取其中的服装单品，构建灵感衣橱
2. **用户自主导入** — 用户拍照或上传自己的衣物图片，手动录入个人衣橱
3. **淘宝购物数据读取** — 读取用户的淘宝购买记录/收藏，自动同步已有衣物信息

## 核心功能

- **衣物识别**：AI 自动识别服装品类、颜色、风格
- **穿搭推荐**：基于场景（通勤/约会/运动等）从衣物库中生成搭配方案
- **风格分析**：分析用户穿搭风格偏好，给出个性化建议

## 项目结构

```text
dazi/
├── frontend/              # 前端 — Vue 3 + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # 后端 — Node.js + Hono
│   ├── src/
│   └── package.json
├── docs/                  # 设计文档
│   └── ...
├── references/            # 预研仓库（参考 Demo）
├── CLAUDE.md              # 开发规范
└── README.md
```

## 技术栈

| 层级 | 选型 |
|------|------|
| 前端 | Vue 3 + Vite + Tailwind CSS |
| 后端 | Node.js + NestJS (TypeScript) |
| AI | 通义千问 (DashScope) 多模态 |
| 包管理 | pnpm |

## 快速启动

```bash
# 前端
cd frontend
pnpm install
pnpm dev

# 后端
cd backend
pnpm install
pnpm dev
```
