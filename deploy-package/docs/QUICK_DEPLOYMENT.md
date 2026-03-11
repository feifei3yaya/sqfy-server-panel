# Squad 面板快速部署指南

## 📋 部署概览

**目标**: 将 Squad 战术小队服务器管理面板部署到腾讯云服务器 (43.138.188.183)

**部署位置**: D:\sqfy-panel

**技术栈**:
- Node.js v24.12.0
- npm v11.6.2
- PM2 (进程管理)
- SQLite (数据库)

## 🚀 快速部署步骤

### 步骤 1️⃣：准备上传文件

**方式 A：使用 WinSCP（推荐，最简单）**

1. 下载 WinSCP: https://winscp.net/eng/download.php
2. 连接到服务器:
   ```
   主机名：43.138.188.183
   用户名：Administrator
   密码：@Kw123456789
   端口：22
   协议：SFTP
   ```
3. 上传以下目录到 `D:\sqfy-panel`:
   - ✅ `server/` (排除 node_modules)
   - ✅ `client/` (排除 node_modules)
   - ✅ `config/`
   - ✅ `docs/`
   - ✅ `plugins/`
   - ✅ 根目录文件：docker-compose.yml, .gitignore, vercel.json

**方式 B：使用 Git Bash SCP 命令**

```bash
# 在 Git Bash 中执行
cd /d/SQFY-v1.0.0.0

# 上传后端
scp -r -o StrictHostKeyChecking=no \
    --exclude='node_modules' --exclude='dist' \
    server/ Administrator@43.138.188.183:"D:/sqfy-panel/server/"

# 上传前端
scp -r -o StrictHostKeyChecking=no \
    --exclude='node_modules' --exclude='dist' \
    client/ Administrator@43.138.188.183:"D:/sqfy-panel/client/"

# 上传其他文件
scp config/* Administrator@43.138.188.183:"D:/sqfy-panel/config/"
scp docs/* Administrator@43.138.188.183:"D:/sqfy-panel/docs/"
scp plugins/* Administrator@43.138.188.183:"D:/sqfy-panel/plugins/"
scp docker-compose.yml .gitignore vercel.json Administrator@43.138.188.183:"D:/sqfy-panel/"
```

### 步骤 2️⃣：SSH 连接并配置环境

连接到服务器：

```bash
ssh Administrator@43.138.188.183
# 密码：@Kw123456789
```

切换到 D 盘并进入项目目录：

```powershell
D:
cd D:\sqfy-panel
```

### 步骤 3️⃣：安装后端依赖

```powershell
cd D:\sqfy-panel\server
npm install --production
```

预计耗时：3-5 分钟

### 步骤 4️⃣：安装前端依赖并构建

```powershell
cd D:\sqfy-panel\client
npm install
npm run build
```

预计耗时：5-8 分钟

### 步骤 5️⃣：配置环境变量

```powershell
cd D:\sqfy-panel\server
notepad .env
```

粘贴以下内容并保存：

```env
# 数据库配置
DATABASE_URL=file:./prisma/dev.db

# JWT 认证
JWT_SECRET=sqfy-panel-2026-production-key-8f7d9c2b1a
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

### 步骤 6️⃣：初始化数据库

```powershell
cd D:\sqfy-panel\server
npx prisma migrate deploy
npx prisma generate
```

### 步骤 7️⃣：安装 PM2

```powershell
npm install -g pm2
```

### 步骤 8️⃣：配置 PM2

创建 PM2 配置文件：

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

### 步骤 9️⃣：启动服务

```powershell
cd D:\sqfy-panel
pm2 start ecosystem.config.js
pm2 save
```

设置开机自启动（复制输出的命令并执行）：

```powershell
pm2 startup
```

### 步骤 🔟：配置防火墙

```powershell
# 允许 3000 端口
netsh advfirewall firewall add rule name="SQFY Panel HTTP" dir=in action=allow protocol=TCP localport=3000

# 允许 22 端口（SSH）
netsh advfirewall firewall add rule name="SSH" dir=in action=allow protocol=TCP localport=22
```

### 步骤 1️⃣1️⃣：验证部署

```powershell
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs

# 测试本地访问
curl http://localhost:3000

# 或测试远程访问
curl http://43.138.188.183:3000
```

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
2. 添加：
   ```
   43.138.188.183    squad-panel.local
   ```
3. 访问：`http://squad-panel.local:3000`

## 📊 部署检查清单

- [ ] 文件已上传到 `D:\sqfy-panel`
- [ ] 后端依赖已安装
- [ ] 前端已构建完成
- [ ] `.env` 文件已配置
- [ ] 数据库已初始化
- [ ] PM2 已安装并配置
- [ ] 服务已启动
- [ ] 防火墙规则已配置
- [ ] 可以通过浏览器访问

## 🔧 常用运维命令

### PM2 管理

```powershell
# 查看状态
pm2 status

# 重启服务
pm2 restart sqfy-server

# 停止服务
pm2 stop sqfy-server

# 查看日志
pm2 logs sqfy-server

# 实时监控
pm2 monit

# 删除服务
pm2 delete sqfy-server
```

### 查看系统资源

```powershell
# 查看 CPU 和内存
tasklist

# 查看端口占用
netstat -ano | findstr :3000

# 查看磁盘空间
wmic logicaldisk get size,freespace,caption
```

### 日志管理

```powershell
# 查看应用日志
type D:\sqfy-panel\server\logs\app.log

# 清理日志
del D:\sqfy-panel\logs\*.log
```

## 🐛 故障排查

### 问题 1：端口被占用

```powershell
# 查找占用进程
netstat -ano | findstr :3000

# 杀死进程
taskkill /F /PID <进程 ID>

# 重启服务
pm2 restart sqfy-server
```

### 问题 2：数据库错误

```powershell
cd D:\sqfy-panel\server
npx prisma migrate reset
npx prisma generate
pm2 restart sqfy-server
```

### 问题 3：前端构建失败

```powershell
cd D:\sqfy-panel\client
del /q node_modules
del /q package-lock.json
npm install
npm run build
```

### 问题 4：PM2 服务异常

```powershell
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### 问题 5：无法远程访问

1. 检查防火墙规则
2. 确认腾讯云安全组开放 3000 端口
3. 检查服务是否运行：`pm2 status`
4. 测试本地访问：`curl http://localhost:3000`

## 📈 性能优化

### 1. 启用 Gzip 压缩

安装 Nginx 并配置：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 配置 Redis 缓存

修改 `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 优化数据库

```powershell
cd D:\sqfy-panel\server
npx prisma migrate dev --name optimize_indexes
```

### 4. 配置 CDN

将静态资源上传到 CDN，修改前端配置。

## 🔒 安全建议

1. **修改 JWT_SECRET**: 使用强随机字符串
2. **启用 HTTPS**: 配置 SSL 证书
3. **配置防火墙**: 只开放必要端口
4. **定期更新**: `npm update`
5. **监控日志**: 定期检查异常
6. **备份数据**: 定期备份 `prisma/dev.db`

## 💾 备份策略

### 数据库备份

```powershell
# 创建备份脚本 backup.bat
@echo off
set BACKUP_DIR=D:\backup
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
xcopy D:\sqfy-panel\server\prisma\dev.db %BACKUP_DIR%\dev.db_%DATE%.bak /Y
echo 备份完成：%DATE%
```

### 配置文件备份

```powershell
xcopy D:\sqfy-panel\server\.env D:\backup\env_%DATE%.bak /Y
```

### 自动化备份

使用 Windows 任务计划程序每天执行备份。

## 📞 技术支持

- **项目文档**: `D:\sqfy-panel\docs\`
- **PM2 文档**: https://pm2.keymetrics.io/
- **Prisma 文档**: https://www.prisma.io/

---

**部署日期**: 2026-03-12  
**服务器**: 腾讯云轻量应用服务器 (43.138.188.183)  
**部署版本**: v1.0.0.0
