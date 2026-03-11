@echo off
chcp 65001 >nul
echo ================================================
echo   Squad 面板远程部署脚本
echo ================================================
echo.

echo [1/8] 检查部署包...
if not exist "D:\SQFY-v1.0.0.0\deploy-package" (
    echo 错误：部署包不存在！
    pause
    exit /b 1
)
echo 部署包检查通过
echo.

echo [2/8] 清理服务器部署目录...
ssh Administrator@43.138.188.183 "cd D: && if exist sqfy-panel rmdir /s /q sqfy-panel && mkdir sqfy-panel"
echo.

echo [3/8] 上传部署包到服务器...
echo 这可能需要几分钟...
for /d %%i in ("D:\SQFY-v1.0.0.0\deploy-package\*") do (
    echo 上传 %%~nxi...
    pscp -r -pw @Kw123456789 -scp "D:\SQFY-v1.0.0.0\deploy-package\%%i" Administrator@43.138.188.183:"D:/sqfy-panel/"
)

echo.
echo [4/8] 上传根目录文件...
pscp -pw @Kw123456789 -scp "D:\SQFY-v1.0.0.0\deploy-package\docker-compose.yml" Administrator@43.138.188.183:"D:/sqfy-panel/"
pscp -pw @Kw123456789 -scp "D:\SQFY-v1.0.0.0\deploy-package\.gitignore" Administrator@43.138.188.183:"D:/sqfy-panel/"
pscp -pw @Kw123456789 -scp "D:\SQFY-v1.0.0.0\deploy-package\vercel.json" Administrator@43.138.188.183:"D:/sqfy-panel/"

echo.
echo [5/8] 连接服务器并安装依赖...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && npm install --production"

echo.
echo [6/8] 安装前端依赖并构建...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\client && npm install && npm run build"

echo.
echo [7/8] 配置环境变量...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && echo DATABASE_URL=file:./prisma/dev.db> .env && echo JWT_SECRET=sqfy-panel-2026-production-key-8f7d9c2b1a3e5f7g>> .env && echo JWT_EXPIRES_IN=7d>> .env && echo PORT=3000>> .env && echo NODE_ENV=production>> .env && echo VITE_API_URL=http://43.138.188.183:3000>> .env"

echo.
echo [8/8] 初始化数据库并启动服务...
ssh Administrator@43.138.188.183 "cd D:\sqfy-panel\server && npx prisma migrate deploy && npx prisma generate && npm install -g pm2 && cd .. && pm2 start ecosystem.config.js && pm2 save"

echo.
echo ================================================
echo   部署完成！
echo ================================================
echo.
pause
