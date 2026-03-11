@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================================
echo   Squad 面板服务器部署 - 自动化部署脚本
echo ================================================
echo.
echo 服务器：43.138.188.183
echo 用户：Administrator
echo 密码：@Kw123456789
echo.

echo [提示] 由于 Windows SSH 限制，将使用以下步骤完成部署:
echo.
echo 步骤 1: 使用 WinSCP 上传文件
echo   1. 下载并安装 WinSCP: https://winscp.net
echo   2. 连接到 43.138.188.183 (用户名：Administrator, 密码：@Kw123456789)
echo   3. 上传 D:\SQFY-v1.0.0.0\deploy-package\ 到 D:\sqfy-panel\
echo.
echo 步骤 2: SSH 连接并执行部署命令
echo   ssh Administrator@43.138.188.183
echo   密码：@Kw123456789
echo.

echo 是否已安装 WinSCP? (Y/N)
set /p HAS_WINSCP=

if /i "%HAS_WINSCP%"=="Y" (
    echo.
    echo 正在启动 WinSCP...
    start "" "C:\Program Files (x86)\WinSCP\WinSCP.exe" sftp://Administrator:@43.138.188.183/
    echo.
    echo 请在 WinSCP 中上传文件到 D:\sqfy-panel\
    echo 上传完成后按任意键继续...
    pause >nul
) else (
    echo.
    echo 请先下载并安装 WinSCP: https://winscp.net/eng/download.php
    echo 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo.
echo [1/6] 连接 SSH...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && npm install --production"

echo.
echo [2/6] 安装前端依赖...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\client && npm install"

echo.
echo [3/6] 构建前端...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\client && npm run build"

echo.
echo [4/6] 配置环境变量...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && echo DATABASE_URL=file:./prisma/dev.db> .env"

echo.
echo [5/6] 初始化数据库...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && npx prisma migrate deploy && npx prisma generate"

echo.
echo [6/6] 安装 PM2 并启动服务...
ssh Administrator@43.138.188.183 "npm install -g pm2 && cd D:\sqfy-panel && pm2 start ecosystem.config.js && pm2 save"

echo.
echo ================================================
echo   部署完成！
echo ================================================
echo.
echo 访问地址：http://43.138.188.183:3000
echo.
pause
