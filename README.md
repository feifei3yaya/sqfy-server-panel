# Squad 战术小队服务器管理面板 (SQFY-v1.0.0.0)

基于 React 和 Node.js 的现代化 Squad 游戏服务器管理系统，为您提供高效、可视化的运维体验。

![仪表盘预览](screenshots/dashboard.png)

## ✨ 核心特性

*   **服务器管理**：通过 RCON 轻松管理多个 Squad 游戏服务器，实时监控状态。
*   **实时仪表盘**：可视化展示在线玩家、服务器负载、管理员值班情况等关键数据。
*   **玩家管理**：查看玩家列表、踢出/封禁玩家、查询历史记录。
*   **RCON 终端**：内置网页版终端，直接执行原生 RCON 指令。
*   **配置编辑器**：在线编辑 `Server.cfg`、`Admins.cfg` 等配置文件，支持本地文件系统及 SFTP。
*   **日志分析**：强大的日志搜索与过滤功能，涵盖聊天日志、击杀日志及管理员操作审计。
*   **战队系统**：创建和管理战队/公会，审核成员申请。
*   **考勤系统**：自动统计管理员在线执勤时长，生成考勤报表。
*   **插件系统**：支持自定义 JavaScript 插件扩展功能。
*   **权限控制**：细粒度的角色权限管理（超级管理员、服务器管理员、观察员）。

## 🛠️ 技术栈

*   **前端**：React, TypeScript, Vite, Ant Design 5.x, TailwindCSS, Recharts
*   **后端**：Node.js, Express, TypeScript, Socket.io
*   **数据库**：SQLite (默认) / PostgreSQL, Prisma ORM
*   **部署**：Docker & Docker Compose

## 📦 快速开始 (Docker 部署)

推荐使用 Docker 进行一键部署。

### 前置要求
*   已安装 Docker 和 Docker Compose。

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/feifei3yaya/sqfy-server-panel.git
    cd sqfy-server-panel
    ```

2.  **配置环境变量**
    复制 `.env.example` 为 `.env` 并按需修改配置（默认配置即可运行）。
    ```bash
    cp .env.example .env
    ```

3.  **启动服务**
    ```bash
    docker-compose up -d
    ```

4.  **访问面板**
    浏览器访问 `http://localhost:3000` (或您配置的端口)。
    初始账号注册后将自动成为超级管理员。

## 🔧 手动开发启动

### 后端 (Server)
```bash
cd server
npm install
npm run dev
```

### 前端 (Client)
```bash
cd client
npm install
npm run dev
```

## 🔌 插件开发

插件位于 `plugins/` 目录。每个插件是一个包含 `manifest.json` 和入口文件（如 `index.js`）的文件夹。
示例结构：
```
plugins/
  my-plugin/
    manifest.json
    index.js
```

## 📄 许可证

MIT License
