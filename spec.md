# Squad战术小队服务器管理面板 (Squad Server Manager) - 项目规格说明书

## 1. 项目概述
本项目旨在开发一个功能完整、专业的Squad游戏服务器管理面板。该面板将支持多服务器集中管理、实时监控、玩家管理、配置管理和日志分析等核心功能，旨在为管理员提供高效、便捷的运维体验。

## 2. 技术架构

### 2.1 前端 (Frontend)
- **框架**: React 18 + Vite
- **UI组件库**: Ant Design 5.x (专业后台管理风格) + TailwindCSS (灵活样式)
- **状态管理**: Redux Toolkit (全局状态) + React Query (服务端状态缓存)
- **数据可视化**: ECharts (高性能图表)
- **国际化**: i18next (中英双语支持)
- **通信**: Axios (RESTful API) + Socket.io-client (实时WebSocket)

### 2.2 后端 (Backend)
- **运行时**: Node.js (LTS版本)
- **框架**: Express.js (轻量级、灵活) 或 NestJS (可选，若需更强规范) -> *本项目采用 Express.js 以快速迭代*
- **API风格**: RESTful API
- **实时通信**: Socket.io (低延迟数据推送)
- **认证**: JWT (JSON Web Token) + Passport.js (支持2FA)
- **RCON客户端**: `squad-rcon` 或自定义TCP实现
- **日志处理**: Winston + Morgan

### 2.3 数据库 (Database)
- **主数据库**: PostgreSQL (生产环境推荐) / SQLite (开发环境/轻量级部署)
- **ORM**: Prisma (类型安全，易于迁移)
- **缓存**: Redis (可选，用于会话/限流，开发阶段可用内存替代)

## 3. 核心功能模块详情

### 3.1 仪表盘 (Dashboard)
- **服务器概览**: 卡片式展示所有服务器在线状态、人数、当前地图。
- **资源监控**: 实时CPU、内存占用图表 (通过Agent或SSH获取)。
- **快捷操作**: 快速重启、关机、广播消息。

### 3.2 服务器管理 (Server Management)
- **列表管理**: 添加/删除/编辑服务器连接信息 (IP, RCON端口, 密码)。
- **配置编辑器**: 可视化编辑 `Server.cfg`, `Admins.cfg`, `MapRotation.cfg` 等文件。
- **版本控制**: 配置文件的历史版本记录与回滚。

### 3.3 玩家管理 (Player Management)
- **在线玩家**: 实时列表，显示SteamID, 队伍, KD(如果RCON支持)等。
- **操作**: 踢出(Kick), 封禁(Ban), 警告(Warn)。
- **黑名单**: 全局封禁列表管理，支持导入导出。

### 3.4 RCON与命令 (RCON & Commands)
- **Web终端**: 网页版RCON控制台，支持命令历史、自动补全。
- **预设命令**: 常用命令快捷键 (如 `AdminChangeMap`, `AdminSlomo`)。
- **定时任务**: 计划任务 (如每天凌晨重启，自动广播)。

### 3.5 日志分析 (Log Analysis)
- **日志采集**: 实时读取服务器日志文件 (需本地代理或FTP/SFTP访问)。
- **智能分析**: 识别TeamKill, 聊天记录, 击杀流。
- **搜索过滤**: 按关键词、时间范围、玩家SteamID搜索。

### 3.6 权限与安全 (Security & Auth)
- **多角色**: 超级管理员, 服务器管理员, 观察员。
- **2FA**: Google Authenticator 集成。
- **操作审计**: 记录所有后台操作日志。

### 3.7 插件系统 (Plugin System)
- **结构**: 模块化加载机制，允许上传 `.js` 或 `.zip` 插件包。
- **市场**: 模拟插件市场界面，查看已安装插件。

### 3.8 高级游戏管理 (Advanced Game Mgmt)
- **特殊豁免 (Reserved Slots)**: VIP/白名单管理，支持期限设置。
- **智能监控**:
    - **卡假人检测**: 自动识别长时间未移动或无操作的玩家并踢出。
    - **TPS监控**: 实时记录服务器 Tick Rate，低于阈值告警。
    - **队伍名限制**: 自动检测并解散违规名称的小队。
- **消息广播**:
    - **欢迎播报**: 玩家入服自动发送个性化欢迎语。
    - **黄字广播**: 醒目的屏幕中央通知 (AdminBroadcast)。
    - **冷知识轮播**: 定时发送游戏技巧提示。
- **辅助功能**:
    - **牛马打卡机**: 统计管理员在线执勤时长，生成考勤报表。
    - **快捷指令**: 预设 "拉研" (快速部署)、"重置载具" 等复杂RCON指令组合。

### 3.9 社区运营系统 (Community Ops)
- **积分系统**: 
    - 根据游玩时长自动发放积分。
    - 积分变动记录与排行榜。
- **CDK兑换**: 
    - 生成兑换码 (CDK)，可兑换积分、VIP时长或特殊物品。
- **团队管理**:
    - 战队/公会创建、成员审批、职位管理。
    - 战队专属服务器槽位或权限。

## 4. 数据库设计 (ER图概念)

- **Users**: `id`, `username`, `password_hash`, `email`, `role`, `2fa_secret`
- **Servers**: `id`, `name`, `host`, `rcon_port`, `rcon_password`, `query_port`
- **Players**: `steam_id`, `name_history`, `reputation`, `first_seen`, `last_seen`, `points`, `total_playtime`
- **Bans**: `id`, `steam_id`, `reason`, `admin_id`, `expires_at`, `type` (SteamID/IP)
- **Whitelists**: `id`, `steam_id`, `server_id`, `expires_at`, `comment`
- **Teams**: `id`, `name`, `tag`, `owner_id`, `description`
- **TeamMembers**: `team_id`, `user_id`, `role`, `joined_at`
- **CDKs**: `code`, `type`, `value`, `is_used`, `used_by`, `created_at`
- **AdminAttendance**: `admin_id`, `server_id`, `session_start`, `session_end`, `duration`
- **Logs**: `id`, `server_id`, `type`, `content`, `timestamp`
- **AuditLogs**: `id`, `user_id`, `action`, `target`, `timestamp`

## 5. 交付标准
- **源码**: 完整的Git仓库结构。
- **文档**: `README.md` (部署), `API.md` (接口), `DB.md` (结构)。
- **测试**: Jest 单元测试覆盖核心逻辑。
- **部署**: `docker-compose.yml` 一键启动。
