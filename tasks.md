# Squad服务器管理面板开发任务清单

## 第一阶段：基础设施与架构 (Week 1)
- [x] **项目初始化**: 创建Monorepo结构 (Frontend + Backend + Shared)。
- [x] **技术选型验证**: 搭建React + Express基础框架，配置ESLint/Prettier。
- [x] **数据库配置**: 安装Prisma ORM，设计并迁移SQLite/PostgreSQL表结构。
- [x] **CI/CD流水线**: 配置Github Actions或本地脚本进行Lint检查与测试 (已配置 .github/workflows/ci.yml)。

## 第二阶段：后端核心开发 (Week 1-2)
- [x] **用户认证模块**: 实现JWT登录、注册、密码哈希、2FA验证API。
- [x] **RCON服务模块**: 集成`squad-rcon`库，实现基本的RCON连接与命令发送。
- [x] **服务器CRUD**: 实现添加、删除、编辑、查询服务器信息的API。
- [x] **WebSocket服务**: 建立Socket.io连接，实现实时状态推送基础。

## 第三阶段：前端核心开发 (Week 2-3)
- [x] **登录/注册页面**: 响应式登录界面，集成2FA输入。
- [x] **仪表盘首页**: 使用ECharts展示服务器在线人数趋势图，CPU/内存卡片 (已使用Recharts实现在线人数趋势)。
- [x] **服务器列表页**: 表格展示服务器状态，支持Ping值检测。
- [x] **控制台页面**: 嵌入Web终端组件，实现RCON命令交互。
- [x] **玩家管理页**: 实时玩家列表，右键菜单支持踢出/封禁。

## 第四阶段：高级功能开发 (Week 3-4)
- [x] **配置管理**: 可视化编辑器，解析`Server.cfg`等文件格式 (已实现基本文本编辑器，支持本地/SFTP)。
- [x] **日志系统**: 实现日志文件读取与解析，前端搜索界面。
- [x] **权限系统**: 角色管理页面，细粒度权限控制API中间件。
- [x] **插件架构**: 设计简单的插件加载机制，允许上传并启用插件 (已实现基本加载器和事件总线，包含示例插件)。

## 第五阶段：高级游戏管理与运营 (Week 4-5)
- [x] **积分与CDK**: 实现游玩时长转积分逻辑，生成与兑换CDK接口。
- [x] **特殊豁免 (VIP)**: 开发VIP管理界面，自动更新 `Admins.cfg` 中的Reserved Slot。
- [x] **智能监控插件**: 开发TPS监控告警、卡假人检测脚本 (在线人数历史图表已实现)。
- [x] **消息广播系统**: 实现定时轮播、入服欢迎、黄字公告功能。
- [x] **团队系统**: 开发战队创建、申请、成员管理功能。
- [x] **辅助工具**: 实现管理员考勤打卡统计报表。
- [x] **数据分析**: 实现历史在线人数、TPS、KD数据图表 (参考 RainOps)。
- [x] **高级日志**: 实现击杀、击倒、聊天记录的持久化存储与查询 (参考 RainOps)。

## 第六阶段：测试与优化 (Week 5-6)
- [x] **单元测试**: 为核心RCON逻辑和Auth模块编写Jest测试 (已完成 auth.test.ts 和 rcon.test.ts)。
- [x] **性能测试**: 模拟50个服务器连接下的WebSocket负载 (已完成 websocket-load-test.ts).
- [x] **UI/UX优化**: 适配移动端布局，深色模式调整 (已实现 MainLayout, Dark Mode toggle, Antd ConfigProvider).
- [x] **文档编写**: 生成Swagger API文档，编写用户手册 (已完成 README.md 和部署指南)。

## 第七阶段：交付准备 (Week 7)
- [x] **Docker化**: 编写`Dockerfile`和`docker-compose.yml` (Client/Server Dockerfile + Nginx Conf + Compose)。
- [x] **部署脚本**: 编写一键部署Shell脚本 (deploy.sh / start.bat)。
- [ ] **演示视频**: 录制系统操作演示。
