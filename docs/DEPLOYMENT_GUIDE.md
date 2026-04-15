# Squad 面板服务器部署指南

## 部署环境信息

- **服务器 IP**: 43.138.188.183
- **用户名**: Administrator
- **密码**: @Kw123456789
- **部署目录**: D:\sqfy-panel
- **Node.js 版本**: v24.12.0
- **npm 版本**: 11.6.2

## 部署步骤

### 步骤 1：上传项目文件

#### 方式一：使用 WinSCP（推荐）

1. 下载并安装 WinSCP: https://winscp.net/
2. 连接到服务器:
   - 主机名：43.138.188.183
   - 用户名：Administrator
   - 密码：@Kw123456789
   - 端口：22
   - 文件协议：SFTP

3. 上传文件到 `D:\sqfy-panel`:
   - 上传 `server/` 目录（排除 node_modules）
   - 上传 `client/` 目录（排除 node_modules）
   - 上传 `config/` 目录
   - 上传 `docs/` 目录
   - 上传 `plugins/` 目录
   - 上传根目录配置文件：docker-compose.yml, .gitignore, vercel.json

#### 方式二：使用命令行 SCP

```bash
# 从 Git Bash 或 Linux 终端执行
scp -r server/ Administrator@43.138.188.183:"D:/sqfy-panel/server/"
scp -r client/ Administrator@43.138.188.183:"D:/sqfy-panel/client/"
scp -r config/ Administrator@43.138.188.183:"D:/sqfy-panel/config/"
scp -r docs/ Administrator@43.138.188.183:"D:/sqfy-panel/docs/"
scp -r plugins/ Administrator@43.138.188.183:"D:/sqfy-panel/plugins/"
scp docker-compose.yml .gitignore vercel.json Administrator@43.138.188.183:"D:/sqfy-panel/"
```

### 步骤 2：安装后端依赖

在 SSH 终端执行：

```powershell
cd D:\sqfy-panel\server
npm install --production
```

### 步骤 3：安装前端依赖并构建

```powershell
cd D:\sqfy-panel\client
npm install
npm run build
```

### 步骤 4：配置环境变量

创建 `.env` 文件：

```powershell
cd D:\sqfy-panel\server
notepad .env
```

填入以下内容：

```env
# 数据库配置
DATABASE_URL=file:./prisma/dev.db

# JWT 认证
JWT_SECRET=sqfy-panel-2026-secret-key-change-this
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000

# 文件上传
MAX_FILE_SIZE=10
UPLOAD_DIR=./uploads

# 日志
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# RCON
RCON_TIMEOUT=5000
RCON_MAX_RETRIES=3

# 安全
PASSWORD_MIN_LENGTH=8
SESSION_EXPIRES_HOURS=24

# CORS
CORS_ENABLED=true
CORS_ORIGIN=*
```

### 步骤 5：初始化数据库

```powershell
cd D:\sqfy-panel\server
npx prisma migrate deploy
npx prisma generate
```

### 步骤 6：安装 PM2

```powershell
npm install -g pm2
```

### 步骤 7：配置 PM2

创建 PM2 配置文件 `D:\sqfy-panel\ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
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
    },
  ],
};
```

### 步骤 8：启动服务

```powershell
cd D:\sqfy-panel
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

执行 `pm2 startup` 输出的命令（需要管理员权限）。

### 步骤 9：配置防火墙

```powershell
# 允许 3000 端口
netsh advfirewall firewall add rule name="SQFY Panel" dir=in action=allow protocol=TCP localport=3000

# 允许 80 端口（如果使用 Nginx）
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80

# 允许 443 端口（如果使用 HTTPS）
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
```

### 步骤 10：验证服务

```powershell
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs

# 测试本地访问
curl http://localhost:3000
```

## 域名配置（可选）

### 本地 hosts 文件配置

在客户端计算机编辑 `C:\Windows\System32\drivers\etc\hosts`，添加：

```
43.138.188.183    squad-panel.local
43.138.188.183    api.squad-panel.local
```

### Nginx 反向代理配置（可选）

如果需要配置域名和 HTTPS，安装 Nginx 并配置：

```nginx
server {
    listen 80;
    server_name squad-panel.local;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 访问测试

1. **本地访问**: http://localhost:3000
2. **远程访问**: http://43.138.188.183:3000
3. **域名访问**: http://squad-panel.local:3000（需配置 hosts）

## 常用 PM2 命令

```powershell
# 查看状态
pm2 status

# 重启应用
pm2 restart sqfy-server

# 停止应用
pm2 stop sqfy-server

# 删除应用
pm2 delete sqfy-server

# 查看日志
pm2 logs sqfy-server

# 监控
pm2 monit
```

## 故障排查

### 1. 端口被占用

```powershell
# 查看端口占用
netstat -ano | findstr :3000

# 杀死进程
taskkill /F /PID <进程 ID>
```

### 2. 数据库错误

```powershell
cd D:\sqfy-panel\server
npx prisma migrate reset
npx prisma generate
```

### 3. 权限问题

确保以管理员身份运行 PowerShell。

### 4. 内存不足

调整 PM2 配置中的 `max_memory_restart` 参数。

## 性能优化建议

1. **启用 Gzip 压缩**
2. **配置 CDN 加速静态资源**
3. **使用 Redis 缓存**
4. **配置数据库连接池**
5. **启用 HTTP/2**
6. **配置 SSL/TLS**

## 安全建议

1. **修改默认密码**
2. **配置防火墙规则**
3. **启用 HTTPS**
4. **定期更新依赖**
5. **配置日志审计**
6. **限制 API 访问频率**
7. **启用 2FA 认证**

## 备份策略

```powershell
# 备份数据库
xcopy D:\sqfy-panel\server\prisma\dev.db D:\backup\dev.db_%date:~0,4%%date:~5,2%%date:~8,2%.bak

# 备份配置文件
xcopy D:\sqfy-panel\server\.env D:\backup\env_%date:~0,4%%date:~5,2%%date:~8,2%.bak
```

## 监控告警

配置系统监控和告警：
- CPU 使用率 > 80%
- 内存使用率 > 85%
- 磁盘使用率 > 90%
- 服务异常停止

---

**部署完成日期**: 2026-03-12  
**技术支持**: 参考项目文档
