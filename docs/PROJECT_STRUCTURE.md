# Squad 战术小队服务器管理面板 - 项目结构说明

## 项目概述

本项目是一个基于 React + TypeScript + Node.js + Prisma 的现代化 Squad 游戏服务器管理系统，采用前后端分离架构，提供高效、可视化的运维体验。

## 技术栈

### 前端 (Client)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Ant Design 6
- **状态管理**: Redux Toolkit
- **路由**: React Router 7
- **HTTP 客户端**: Axios
- **实时通信**: Socket.io Client
- **国际化**: i18next
- **图表**: ECharts, Recharts
- **样式**: TailwindCSS 4
- **测试**: Vitest + Testing Library, Playwright

### 后端 (Server)
- **运行时**: Node.js
- **框架**: Express 5
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **实时通信**: Socket.io
- **认证**: JWT + bcrypt + speakeasy (2FA)
- **验证**: Zod
- **RCON**: squad-rcon
- **SFTP**: ssh2-sftp-client, basic-ftp

## 目录结构

```
SQFY-v1.0.0.0/
├── .github/                    # GitHub 配置（CI/CD 工作流）
├── .trae/                      # Trae IDE 配置
│   └── rules/                  # 项目规范和规则
├── assets/                     # 项目资源文件
│   └── tools/                  # 第三方工具
├── client/                     # 前端项目
│   ├── e2e/                    # E2E 测试（Playwright）
│   ├── public/                 # 静态资源
│   ├── src/                    # 源代码
│   │   ├── __tests__/          # 单元测试
│   │   ├── api/                # API 客户端（Axios 封装）
│   │   ├── assets/             # 组件资源（图片、SVG 等）
│   │   ├── components/         # React 组件
│   │   │   ├── common/         # 通用组件
│   │   │   ├── config/         # 配置编辑器组件
│   │   │   ├── dashboard/      # 仪表盘组件
│   │   │   └── game/           # 游戏相关组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── i18n/               # 国际化配置
│   │   │   └── locales/        # 语言包
│   │   ├── pages/              # 页面组件
│   │   ├── store/              # Redux 状态管理
│   │   ├── test/               # 测试配置
│   │   ├── utils/              # 工具函数
│   │   ├── App.tsx             # 应用根组件
│   │   ├── main.tsx            # 应用入口
│   │   └── theme.ts            # 主题配置
│   ├── .gitignore
│   ├── Dockerfile              # 前端 Docker 配置
│   ├── eslint.config.js        # ESLint 配置
│   ├── index.html              # HTML 模板
│   ├── nginx.conf              # Nginx 配置
│   ├── package.json
│   ├── playwright.config.ts    # Playwright 配置
│   ├── tsconfig.json           # TypeScript 配置
│   └── vite.config.ts          # Vite 配置
├── config/                     # 项目配置文件
│   ├── keys/                   # SSH 密钥等敏感文件
│   └── .env.example            # 环境变量示例
├── data/                       # 运行时数据
│   └── user/                   # 用户数据
├── docs/                       # 项目文档
│   ├── PROJECT_STRUCTURE.md    # 项目结构说明（本文档）
│   └── screenshots/            # 项目截图
├── plugins/                    # 插件目录
│   └── example-plugin/         # 示例插件
├── scripts/                    # 脚本工具
│   └── deployment/             # 部署脚本
├── server/                     # 后端项目
│   ├── config/                 # 后端配置文件
│   ├── prisma/                 # Prisma ORM 配置
│   │   ├── migrations/         # 数据库迁移文件
│   │   ├── schema.prisma       # 数据模型定义
│   │   └── dev.db              # 开发数据库
│   ├── scripts/                # 后端工具脚本
│   ├── src/                    # 源代码
│   │   ├── __tests__/          # 单元测试
│   │   ├── controllers/        # 控制器层（业务逻辑）
│   │   ├── middlewares/        # 中间件（认证、错误处理）
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 服务层（核心业务逻辑）
│   │   ├── types/              # TypeScript 类型定义
│   │   ├── utils/              # 工具函数
│   │   │   └── parsers/        # 日志解析器
│   │   └── index.ts            # 应用入口
│   ├── tests/                  # 集成测试
│   ├── .gitignore
│   ├── babel.config.js         # Babel 配置
│   ├── Dockerfile              # 后端 Docker 配置
│   ├── jest.config.js          # Jest 测试配置
│   ├── package.json
│   └── tsconfig.json           # TypeScript 配置
├── src/                        # 独立工具模块
│   └── SquadUpdateManager/     # Squad 服务器更新管理器（PowerShell）
├── .dockerignore               # Docker 忽略文件
├── .gitignore                  # Git 忽略文件
├── .vercelignore               # Vercel 忽略文件
├── deploy.sh                   # 部署脚本
├── docker-compose.yml          # Docker Compose 配置
├── package.json                # 根目录依赖（可选）
└── vercel.json                 # Vercel 部署配置
```

## 模块说明

### 前端模块 (client/src)

#### API 层 (api/)
封装所有与后端的 HTTP 通信，每个业务模块对应一个 API 文件：
- `auth.ts` - 认证相关 API
- `server.ts` - 服务器管理 API
- `player.ts` - 玩家管理 API
- `config.ts` - 配置文件 API
- `log.ts` - 日志查看 API
- 等等...

#### 组件层 (components/)
按功能模块组织：
- **common/** - 通用组件（用户头像、统一表格等）
- **dashboard/** - 仪表盘相关组件
- **game/** - 游戏相关组件（战队卡片、角色图标等）
- **config/** - 配置编辑器组件

#### 页面层 (pages/)
每个页面对应一个完整的功能页面：
- `Home.tsx` - 首页/仪表盘
- `Login.tsx` - 登录页
- `ServerList.tsx` - 服务器列表
- `PlayerList.tsx` - 玩家列表
- `ConfigEditor.tsx` - 配置编辑器
- 等等...

#### 状态管理 (store/)
使用 Redux Toolkit 管理全局状态：
- `authSlice.ts` - 认证状态
- `themeSlice.ts` - 主题状态
- `hooks.ts` - Redux Hooks 导出
- `index.ts` - Store 配置

#### 自定义 Hooks (hooks/)
封装可复用的业务逻辑：
- `useSidebarLayout.ts` - 侧边栏布局
- `useServerPermission.ts` - 服务器权限检查

### 后端模块 (server/src)

#### 控制器层 (controllers/)
处理 HTTP 请求，调用服务层，返回响应：
- `authController.ts` - 认证控制器
- `serverController.ts` - 服务器管理控制器
- `playerController.ts` - 玩家管理控制器
- `configController.ts` - 配置管理控制器
- 等等...

#### 服务层 (services/)
核心业务逻辑，可被多个控制器复用：
- `rconService.ts` - RCON 连接和命令执行
- `gameStateService.ts` - 游戏状态监控
- `logService.ts` - 日志处理
- `notificationService.ts` - 通知系统
- `schedulerService.ts` - 定时任务
- 等等...

#### 路由层 (routes/)
定义 API 路由，绑定控制器：
- 每个路由文件对应一个业务模块
- 使用 Express Router
- 应用认证和权限中间件

#### 中间件 (middlewares/)
- `auth.ts` - JWT 认证中间件
- `errorHandler.ts` - 全局错误处理

#### 工具层 (utils/)
- `auth.ts` - 认证工具（JWT、密码加密）
- `response.ts` - 统一响应格式
- `logParser.ts` - 日志解析
- `parsers/` - 各种日志解析器实现

## 命名规范

### 文件命名
- **React 组件**: PascalCase (e.g., `UserAvatar.tsx`)
- **工具函数**: camelCase (e.g., `httpError.ts`)
- **控制器**: camelCase + Controller 后缀 (e.g., `authController.ts`)
- **服务**: camelCase + Service 后缀 (e.g., `rconService.ts`)
- **路由**: camelCase + Routes 后缀 (e.g., `authRoutes.ts`)
- **测试文件**: 与被测试文件同名 + `.test` 或 `.spec` 后缀

### 目录命名
- 全部使用小写 + 连字符（kebab-case）或纯小写
- 例如：`components/`, `api/`, `utils/`

## 依赖管理

### 前端依赖分类
- **核心框架**: react, react-dom
- **构建工具**: vite, typescript
- **UI 组件**: antd, @ant-design/icons
- **状态管理**: @reduxjs/toolkit, react-redux
- **路由**: react-router-dom
- **HTTP**: axios
- **实时通信**: socket.io-client
- **图表**: echarts, recharts, echarts-for-react
- **国际化**: i18next, react-i18next
- **样式**: tailwindcss, postcss, autoprefixer
- **测试**: vitest, @testing-library/*, playwright

### 后端依赖分类
- **核心框架**: express, typescript
- **数据库**: prisma, @prisma/client
- **认证**: jsonwebtoken, bcrypt, speakeasy
- **验证**: zod
- **实时通信**: socket.io
- **RCON**: squad-rcon
- **SFTP**: ssh2-sftp-client, basic-ftp
- **日志**: morgan, tail
- **安全**: helmet
- **文件上传**: multer
- **定时任务**: node-schedule
- **其他工具**: uuid, dayjs, qrcode, discord.js, tencentcloud-sdk-nodejs

## 部署架构

### Docker 部署
使用 `docker-compose.yml` 一键部署：
- **frontend**: React 应用（Nginx 托管）
- **backend**: Node.js 应用
- **database**: SQLite 文件卷挂载

### Vercel 部署
- 前端部署到 Vercel
- 后端可部署到 Vercel Serverless Functions 或独立服务器

## 开发工作流

1. **安装依赖**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **启动开发环境**
   ```bash
   # 后端
   cd server && npm run dev
   
   # 前端（新终端）
   cd client && npm run dev
   ```

3. **运行测试**
   ```bash
   # 前端测试
   cd client && npm test
   
   # 后端测试
   cd server && npm test
   
   # E2E 测试
   cd client && npm run test:e2e
   ```

4. **构建生产版本**
   ```bash
   # 前端构建
   cd client && npm run build
   
   # 后端构建
   cd server && npm run build
   ```

## 扩展性设计

### 插件系统
- 插件位于 `plugins/` 目录
- 每个插件包含 `manifest.json` 和入口文件
- 后端提供插件加载和管理 API

### 模块化架构
- 前后端均采用模块化设计
- 服务层可独立复用
- API 层按业务模块划分
- 组件层支持按需加载

## 维护建议

1. **代码组织**: 新增功能时，按照现有模块结构添加对应文件
2. **测试覆盖**: 为核心业务逻辑编写单元测试
3. **文档更新**: 修改结构后及时更新本文档
4. **依赖管理**: 定期更新依赖版本，移除未使用的包
5. **性能优化**: 关注打包体积，使用懒加载和代码分割
