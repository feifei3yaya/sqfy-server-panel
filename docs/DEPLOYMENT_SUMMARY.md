# Squad 战术小队服务器管理面板 - 部署完成总结

## 📦 部署信息

### 服务器信息
- **服务器 IP**: 43.138.188.183
- **用户名**: Administrator
- **密码**: @Kw123456789
- **系统**: Windows Server 2019
- **部署目录**: D:\sqfy-panel

### 环境信息
- **Node.js**: v24.12.0 ✅ 已安装
- **npm**: v11.6.2 ✅ 已安装
- **可用磁盘空间**: 296GB (D 盘) ✅ 充足

### 项目信息
- **项目名称**: Squad 战术小队服务器管理面板 (SQFY-v1.0.0.0)
- **技术栈**: React 19 + TypeScript + Node.js + Prisma
- **前端端口**: 5173 (开发) / 80 (生产)
- **后端端口**: 3000

## ✅ 已完成的工作

### 1. 服务器环境检查 ✅
- [x] 检查磁盘空间（296GB 可用）
- [x] 验证 Node.js 安装（v24.12.0）
- [x] 验证 npm 安装（v11.6.2）
- [x] 创建部署目录（D:\sqfy-panel）
- [x] 创建子目录结构（server, client, config, docs, plugins, logs）

### 2. 项目结构整理 ✅
- [x] 清理无用文件（50+ 个文件）
- [x] 统一文件命名规范
- [x] 完善项目文档
- [x] 创建 .gitignore 规则
- [x] 创建环境变量示例

### 3. 部署文档创建 ✅
- [x] 创建快速部署指南 (QUICK_DEPLOYMENT.md)
- [x] 创建详细部署指南 (DEPLOYMENT_GUIDE.md)
- [x] 创建项目结构文档 (PROJECT_STRUCTURE.md)
- [x] 创建部署总结文档 (本文档)

### 4. 部署脚本创建 ✅
- [x] 创建 Windows 部署脚本 (package-deploy.bat)
- [x] 创建 PowerShell 部署脚本 (deploy-remote.ps1)
- [x] 创建 Python SFTP 脚本 (deploy_to_server.py)
- [x] 创建排除文件列表 (deploy-exclude.txt)

## 📋 部署步骤（请按顺序执行）

### 方案 A：使用 WinSCP 图形界面（推荐新手）

#### 第 1 步：下载并安装 WinSCP
访问：https://winscp.net/eng/download.php

#### 第 2 步：连接到服务器
```
文件协议：SFTP
主机名：43.138.188.183
端口号：22
用户名：Administrator
密码：@Kw123456789
```

#### 第 3 步：上传文件
从本地 `d:\SQFY-v1.0.0.0\` 上传以下内容到远程 `D:\sqfy-panel\`:

**必须上传的目录**:
- `server/` → `D:\sqfy-panel\server\`
- `client/` → `D:\sqfy-panel\client\`
- `config/` → `D:\sqfy-panel\config\`
- `docs/` → `D:\sqfy-panel\docs\`
- `plugins/` → `D:\sqfy-panel\plugins\`

**必须上传的根目录文件**:
- `docker-compose.yml`
- `.gitignore`
- `vercel.json`

**不要上传的目录**:
- ❌ node_modules
- ❌ dist
- ❌ build
- ❌ .git
- ❌ data
- ❌ logs

#### 第 4 步：SSH 连接并配置
打开 PowerShell 或 CMD，执行：

```bash
ssh Administrator@43.138.188.183
# 输入密码：@Kw123456789
```

#### 第 5 步：安装依赖
```powershell
# 切换到 D 盘
D:

# 进入项目目录
cd D:\sqfy-panel\server

# 安装后端依赖
npm install --production

# 切换到前端目录
cd D:\sqfy-panel\client

# 安装前端依赖并构建
npm install
npm run build
```

#### 第 6 步：配置环境变量
```powershell
cd D:\sqfy-panel\server
notepad .env
```

粘贴以下内容并保存（Ctrl+S）：

```env
# 数据库配置
DATABASE_URL=file:./prisma/dev.db

# JWT 认证 - 请修改为随机字符串
JWT_SECRET=sqfy-panel-2026-production-key-8f7d9c2b1a3e5f7g
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=production

# 前端 API 地址
VITE_API_URL=http://43.138.188.183:3000

# 文件上传
MAX_FILE_SIZE=10
UPLOAD_DIR=./uploads

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# RCON 配置
RCON_TIMEOUT=5000
RCON_MAX_RETRIES=3

# 安全配置
PASSWORD_MIN_LENGTH=8
SESSION_EXPIRES_HOURS=24

# CORS
CORS_ENABLED=true
CORS_ORIGIN=*
```

#### 第 7 步：初始化数据库
```powershell
cd D:\sqfy-panel\server
npx prisma migrate deploy
npx prisma generate
```

#### 第 8 步：安装 PM2
```powershell
npm install -g pm2
```

#### 第 9 步：配置 PM2
```powershell
cd D:\sqfy-panel
notepad ecosystem.config.js
```

粘贴以下内容：

```javascript
module.exports = {
  apps: [{
    name: 'sqfy-server',
    cwd: './server',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};
```

#### 第 10 步：启动服务
```powershell
cd D:\sqfy-panel
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

执行 `pm2 startup` 输出的命令（需要复制并粘贴执行）。

#### 第 11 步：配置防火墙
```powershell
# 允许 3000 端口
netsh advfirewall firewall add rule name="SQFY Panel HTTP" dir=in action=allow protocol=TCP localport=3000

# 允许 22 端口（SSH）
netsh advfirewall firewall add rule name="SSH" dir=in action=allow protocol=TCP localport=22
```

#### 第 12 步：验证部署
```powershell
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs

# 测试本地访问
curl http://localhost:3000
```

### 方案 B：使用命令行 SCP（推荐高级用户）

如果你有 Git Bash，可以使用以下命令：

```bash
cd /d/SQFY-v1.0.0.0

# 上传后端
scp -r server/ Administrator@43.138.188.183:"D:/sqfy-panel/server/"

# 上传前端
scp -r client/ Administrator@43.138.188.183:"D:/sqfy-panel/client/"

# 上传其他文件
scp config/* Administrator@43.138.188.183:"D:/sqfy-panel/config/"
scp docs/* Administrator@43.138.188.183:"D:/sqfy-panel/docs/"
scp plugins/* Administrator@43.138.188.183:"D:/sqfy-panel/plugins/"
scp docker-compose.yml .gitignore vercel.json Administrator@43.138.188.183:"D:/sqfy-panel/"
```

然后按照方案 A 的步骤 4-12 执行。

## 🌐 访问方式

### 本地访问（在服务器上）
```
http://localhost:3000
```

### 远程访问（从你的电脑）
```
http://43.138.188.183:3000
```

### 域名访问（可选）

1. 编辑本地 hosts 文件：`C:\Windows\System32\drivers\etc\hosts`
2. 添加以下行：
   ```
   43.138.188.183    squad-panel.local
   43.138.188.183    api.squad-panel.local
   ```
3. 访问：`http://squad-panel.local:3000`

## 📊 部署检查清单

请逐项检查：

- [ ] ✅ 服务器环境检查完成
- [ ] ⬜ 使用 WinSCP 上传文件
- [ ] ⬜ SSH 连接到服务器
- [ ] ⬜ 安装后端依赖
- [ ] ⬜ 安装前端依赖并构建
- [ ] ⬜ 配置 .env 环境变量
- [ ] ⬜ 初始化数据库
- [ ] ⬜ 安装 PM2
- [ ] ⬜ 配置 PM2
- [ ] ⬜ 启动服务
- [ ] ⬜ 配置防火墙
- [ ] ⬜ 验证访问
- [ ] ⬜ 测试所有功能

## 🔧 常用命令

### PM2 管理
```powershell
pm2 status          # 查看状态
pm2 restart sqfy-server  # 重启服务
pm2 stop sqfy-server     # 停止服务
pm2 logs sqfy-server     # 查看日志
pm2 monit                # 实时监控
```

### 系统检查
```powershell
netstat -ano | findstr :3000  # 查看端口占用
tasklist | findstr node       # 查看 Node 进程
dir D:\sqfy-panel             # 查看项目文件
```

### 日志查看
```powershell
type D:\sqfy-panel\server\logs\app.log
```

## 🐛 故障排查

### 问题 1：无法访问 3000 端口

**解决方案**:
1. 检查 PM2 状态：`pm2 status`
2. 检查防火墙规则：`netsh advfirewall show rule name=SQFY`
3. 检查端口占用：`netstat -ano | findstr :3000`
4. 重启服务：`pm2 restart sqfy-server`

### 问题 2：数据库错误

**解决方案**:
```powershell
cd D:\sqfy-panel\server
npx prisma migrate reset
npx prisma generate
pm2 restart sqfy-server
```

### 问题 3：前端构建失败

**解决方案**:
```powershell
cd D:\sqfy-panel\client
npm install
npm run build
```

### 问题 4：PM2 服务异常

**解决方案**:
```powershell
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## 📞 技术支持

### 文档位置
- **快速部署指南**: `D:\sqfy-panel\docs\QUICK_DEPLOYMENT.md`
- **详细部署指南**: `D:\sqfy-panel\docs\DEPLOYMENT_GUIDE.md`
- **项目结构**: `D:\sqfy-panel\docs\PROJECT_STRUCTURE.md`
- **重构报告**: `D:\sqfy-panel\docs\REFACTOR_REPORT.md`

### 在线资源
- **Squad Wiki**: https://squad.fandom.com/wiki/Squad_Wiki
- **PM2 文档**: https://pm2.keymetrics.io/
- **Prisma 文档**: https://www.prisma.io/
- **React 文档**: https://react.dev/

## 📈 后续优化建议

### 短期（1-2 周）
1. 配置 HTTPS（SSL 证书）
2. 配置 Nginx 反向代理
3. 设置自动备份
4. 配置监控告警

### 中期（1 个月）
1. 配置 Redis 缓存
2. 优化数据库查询
3. 配置 CDN 加速
4. 实现负载均衡

### 长期（3 个月+）
1. 容器化部署（Docker）
2. CI/CD自动化流程
3. 微服务架构改造
4. 性能监控平台

## 🔒 安全提醒

1. **立即修改 JWT_SECRET**: 使用强随机字符串
2. **定期更新密码**: 建议每月更新
3. **配置 SSL/TLS**: 启用 HTTPS
4. **定期备份**: 每天备份数据库和配置文件
5. **监控日志**: 及时发现异常访问
6. **更新依赖**: 定期执行 `npm update`

## 📝 总结

### 已完成
- ✅ 服务器环境检查
- ✅ 部署目录创建
- ✅ 项目结构整理
- ✅ 部署文档编写
- ✅ 部署脚本创建

### 待执行（需要手动操作）
- ⬜ 使用 WinSCP 上传文件
- ⬜ 安装项目依赖
- ⬜ 配置环境变量
- ⬜ 启动 PM2 服务
- ⬜ 配置防火墙
- ⬜ 验证访问

### 预计耗时
- **文件上传**: 10-15 分钟（取决于网络速度）
- **依赖安装**: 8-13 分钟
- **配置和启动**: 5-10 分钟
- **总计**: 约 25-40 分钟

---

**部署日期**: 2026-03-12  
**服务器**: 腾讯云轻量应用服务器  
**IP 地址**: 43.138.188.183  
**项目版本**: v1.0.0.0  
**技术支持文档**: `D:\SQFY-v1.0.0.0\docs\QUICK_DEPLOYMENT.md`

**祝部署顺利！🎉**
