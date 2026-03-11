@echo off
chcp 65001 >nul
echo ================================================
echo   Squad 面板一键部署脚本
echo ================================================
echo.

set SERVER=43.138.188.183
set USER=Administrator
set PASS=@Kw123456789
set LOCAL_DIR=%~dp0
set REMOTE_DIR=D:\sqfy-panel

echo [1/6] 上传简化的服务器文件...
echo 请使用 WinSCP 将以下文件上传到服务器:
echo   %LOCAL_DIR%server\simple-server.js
echo   目标路径: %REMOTE_DIR%\server\simple-server.js
echo.

echo [2/6] 连接服务器并启动服务...
ssh %USER%@%SERVER% "cd %REMOTE_DIR%\server && pm2 delete all 2>nul && pm2 start simple-server.js --name sqfy-api && pm2 save"

echo.
echo [3/6] 检查服务状态...
ssh %USER%@%SERVER% "pm2 status"

echo.
echo [4/6] 配置防火墙...
ssh %USER%@%SERVER% "netsh advfirewall firewall add rule name=\"SQFY Panel\" dir=in action=allow protocol=TCP localport=3000"

echo.
echo [5/6] 上传前端构建文件...
echo 请使用 WinSCP 将以下目录上传到服务器:
echo   %LOCAL_DIR%client\dist
echo   目标路径: %REMOTE_DIR%\client\dist

echo.
echo ================================================
echo   部署完成！
echo ================================================
echo.
echo 访问地址：
echo   - API: http://%SERVER%:3000
echo   - 前端: http://%SERVER%:3000 (需要上传 dist 目录)
echo.
pause
