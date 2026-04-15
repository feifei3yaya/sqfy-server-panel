# 🚀 Squad 面板一键部署指南

## 📋 部署前准备

### 已完成的准备工作 ✅
1. ✅ 服务器环境检查（Node.js v24.12.0, npm v11.6.2）
2. ✅ 创建部署目录（D:\sqfy-panel）
3. ✅ 创建本地部署包（D:\SQFY-v1.0.0.0\deploy-package\）
4. ✅ 项目文件已打包（排除 node_modules, dist 等）

### 需要手动完成的步骤 ⬜
1. ⬜ 使用 WinSCP 上传文件到服务器
2. ⬜ SSH 连接执行部署命令

## 📦 快速部署（10 分钟完成）

### 方法一：使用 WinSCP（最简单，推荐）

#### 第 1 步：下载 WinSCP
访问：https://winscp.net/eng/download.php  
下载并安装 WinSCP

#### 第 2 步：连接服务器
打开 WinSCP，输入：
```
文件协议：SFTP
主机名：43.138.188.183
端口号：22
用户名：Administrator
密码：@Kw123456789
```
点击"登录"

#### 第 3 步：上传文件
在 WinSCP 中：
- **本地窗口**（左侧）：导航到 `D:\SQFY-v1.0.0.0\deploy-package\`
- **远程窗口**（右侧）：导航到 `D:\sqfy-panel\`
- 选中左侧所有文件（Ctrl+A）
- 点击"复制"按钮（或直接拖拽到右侧）

等待上传完成（约 5-10 分钟）

#### 第 4 步：SSH 连接
打开 PowerShell 或 CMD，执行：
```bash
ssh Administrator@43.138.188.183
```
输入密码：`@Kw123456789`

#### 第 5 步：执行部署命令
连接成功后，依次执行以下命令：

```powershell
# 切换到 D 盘
D:

# 进入项目目录
cd D:\sqfy-panel

# 安装后端依赖
cd server
npm install --production

# 安装前端依赖并构建
cd ..\client
npm install
npm run build

# 配置环境变量
cd ..\server
notepad .env
```

在记事本中粘贴以下内容，然后保存（Ctrl+S）并关闭：
```env
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=sqfy-panel-2026-production-key-8f7d9c2b1a3e5f7g
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=10
UPLOAD_DIR=./uploads
LOG_LEVEL=info
LOG_FILE=./logs/app.log
RCON_TIMEOUT=5000
RCON_MAX_RETRIES=3
PASSWORD_MIN_LENGTH=8
SESSION_EXPIRES_HOURS=24
CORS_ENABLED=true
CORS_ORIGIN=*
```

继续执行：
```powershell
# 初始化数据库
npx prisma migrate deploy
npx prisma generate

# 安装 PM2
npm install -g pm2

# 启动服务
cd ..
pm2 start ecosystem.config.js
pm2 save

# 配置开机自启（复制输出的命令并执行）
pm2 startup
```

#### 第 6 步：配置防火墙
在本地 PowerShell（以管理员身份运行）执行：
```powershell
netsh advfirewall firewall add rule name="SQFY Panel HTTP" dir=in action=allow protocol=TCP localport=3000
```

#### 第 7 步：验证部署
浏览器访问：http://43.138.188.183:3000

## 🎉 部署完成！

### 访问地址
- **远程访问**: http://43.138.188.183:3000
- **本地访问**: http://localhost:3000

### 常用命令
```powershell
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart sqfy-server

# 停止服务
pm2 stop sqfy-server
```

## 🆘 故障排查

### 问题 1：WinSCP 连接失败
- 检查服务器是否开机
- 检查防火墙是否允许 SSH（端口 22）
- 确认用户名密码正确

### 问题 2：npm install 失败
- 检查网络连接
- 使用淘宝镜像：`npm config set registry https://registry.npmmirror.com`

### 问题 3：构建失败
- 检查磁盘空间
- 删除 node_modules 重新安装

### 问题 4：无法访问 3000 端口
- 检查防火墙规则
- 检查 PM2 状态：`pm2 status`
- 查看日志：`pm2 logs`

## 📞 技术支持

详细文档：`D:\SQFY-v1.0.0.0\docs\QUICK_DEPLOYMENT.md`

---

**部署日期**: 2026-03-12  
**服务器**: 43.138.188.183  
**预计耗时**: 10-15 分钟
