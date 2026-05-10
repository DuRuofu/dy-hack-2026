# CLAUDE.md - 项目开发规范

## 项目概述

抖音黑客松预研仓库，目标是构建可组合的 AI Demo 模块，比赛当天根据关键词快速二次创作。

## 技术栈约束

### 核心原则

- **禁止使用 Python** 作为主要开发语言，所有 Demo 代码必须使用 **Node.js / TypeScript** 编写
- 包管理器统一使用 **pnpm**，禁止使用 npm / yarn

### 前端

- 框架：**Vue 3**（Composition API + `<script setup>`）
- 构建工具：Vite
- UI 库：按需引入，优先轻量方案（如 Naive UI / Element Plus）
- 样式：Tailwind CSS（如需要）

### 后端 / 服务端

- 运行时：Node.js + TypeScript
- 框架：轻量优先（如 Hono / Fastify），不做重型 NestJS
- AI API 调用：直接使用官方 SDK（`@anthropic-ai/sdk`、`openai` 等）

### 数据库

- **优先使用 SQLite**（本地文件数据库，零配置）
- 如果 SQLite 无法满足需求，使用 **PostgreSQL**
- ORM：Drizzle ORM（优先）或 Prisma

### 可用中间件

| 组件 | 用途 |
|------|------|
| Redis | 缓存、会话、消息队列 |
| MQTT | 设备通信、实时消息 |
| InfluxDB | 时序数据存储 |

使用这些组件时提前说明用途，避免过度设计。

## 包管理

```bash
# 所有操作使用 pnpm
pnpm install
pnpm add <package>
pnpm add -D <package>
pnpm dev
pnpm build
```

## 项目结构约定

```text
copilot-lab/
├── CLAUDE.md
├── README.md
├── demos/                             # 所有 Demo
│   ├── demo1-video-parse/             #   每个 Demo 是独立工程
│   ├── demo2-image-understand/
│   └── ...
└── docs/                              # 各 Demo 技术路线文档
```

每个 Demo 是独立工程（有自己的 package.json），进入目录后 `pnpm install && pnpm dev` 即可运行。Demo 之间通过 JSON 文件或函数调用传递数据，共享类型定义在各 Demo 内部维护。

## 代码规范

- TypeScript 严格模式（`strict: true`）
- 使用 `ESLint` + `Prettier` 保持代码风格一致
- 异步操作统一使用 `async/await`，不使用回调
- 环境变量通过 `.env` 文件管理，使用 `dotenv` 加载
- API Key 等敏感信息绝不提交到仓库

## Demo 间数据流

Demo 之间通过 JSON 文件或函数调用传递数据，不引入复杂的消息队列（除非明确需要）。

## 命名约定

- 目录：kebab-case（`demo1-video-parse`）
- 文件：camelCase（`videoParser.ts`）或 PascalCase（组件文件）
- 变量/函数：camelCase
- 类型/接口：PascalCase
