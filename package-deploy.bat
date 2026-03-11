@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===============================================
echo   Squad 面板本地打包脚本
echo ===============================================
echo.

REM 设置目录
set SOURCE_DIR=%~dp0..
set PACKAGE_DIR=%SOURCE_DIR%\deploy-package
set SERVER_TARGET=D:\sqfy-panel

echo [1/3] 清理旧的打包目录...
if exist "%PACKAGE_DIR%" rmdir /s /q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"

echo [2/3] 创建目录结构...
mkdir "%PACKAGE_DIR%\server"
mkdir "%PACKAGE_DIR%\client"
mkdir "%PACKAGE_DIR%\config"
mkdir "%PACKAGE_DIR%\docs"
mkdir "%PACKAGE_DIR%\plugins"
mkdir "%PACKAGE_DIR%\scripts"

echo [3/3] 复制文件...

echo 复制后端文件...
xcopy /E /I /Y /EXCLUDE:deploy-exclude.txt "%SOURCE_DIR%\server" "%PACKAGE_DIR%\server"

echo 复制前端文件...
xcopy /E /I /Y /EXCLUDE:deploy-exclude.txt "%SOURCE_DIR%\client" "%PACKAGE_DIR%\client"

echo 复制配置文件...
xcopy /E /I /Y "%SOURCE_DIR%\config" "%PACKAGE_DIR%\config"

echo 复制文档...
xcopy /E /I /Y "%SOURCE_DIR%\docs" "%PACKAGE_DIR%\docs"

echo 复制插件...
xcopy /E /I /Y "%SOURCE_DIR%\plugins" "%PACKAGE_DIR%\plugins"

echo 复制部署脚本...
xcopy /E /I /Y "%SOURCE_DIR%\scripts\deployment" "%PACKAGE_DIR%\scripts\deployment"

echo 复制根目录文件...
copy /Y "%SOURCE_DIR%\docker-compose.yml" "%PACKAGE_DIR%\"
copy /Y "%SOURCE_DIR%\.gitignore" "%PACKAGE_DIR%\"
copy /Y "%SOURCE_DIR%\vercel.json" "%PACKAGE_DIR%\"

echo.
echo ===============================================
echo   打包完成！
echo ===============================================
echo.
echo 包位置：%PACKAGE_DIR%
echo.
echo 下一步：
echo 1. 使用 WinSCP 将 %PACKAGE_DIR% 上传到服务器 D:\sqfy-panel
echo 2. 或执行：deploy-to-server.bat
echo.
pause
