@echo off
chcp 65001 >nul
echo ==================== Squad 面板部署脚本 ====================
echo.
echo 正在复制项目文件到服务器 D:\sqfy-panel...
echo.

REM 设置源目录和目标目录
set SOURCE=%~dp0..
set TARGET=D:\sqfy-panel

echo 源目录：%SOURCE%
echo 目标目录：%TARGET%
echo.

REM 创建目标目录结构
echo 创建目录结构...
mkdir "%TARGET%\server" 2>nul
mkdir "%TARGET%\client" 2>nul
mkdir "%TARGET%\config" 2>nul
mkdir "%TARGET%\docs" 2>nul
mkdir "%TARGET%\plugins" 2>nul

echo.
echo 正在复制后端文件...
robocopy "%SOURCE%\server" "%TARGET%\server" /E /XD node_modules dist build .git .vscode /XF *.log /R:2 /W:2 /NFL /NDL /NP

echo.
echo 正在复制前端文件...
robocopy "%SOURCE%\client" "%TARGET%\client" /E /XD node_modules dist build .git .vscode test-results coverage /XF *.log /R:2 /W:2 /NFL /NDL /NP

echo.
echo 正在复制配置文件...
robocopy "%SOURCE%\config" "%TARGET%\config" /E /XD node_modules /R:2 /W:2 /NFL /NDL /NP
robocopy "%SOURCE%" "%TARGET%" docker-compose.yml .dockerignore .gitignore .vercelignore vercel.json /R:2 /W:2 /NFL /NDL /NP

echo.
echo 正在复制文档...
robocopy "%SOURCE%\docs" "%TARGET%\docs" /E /XD node_modules /R:2 /W:2 /NFL /NDL /NP

echo.
echo 正在复制插件...
robocopy "%SOURCE%\plugins" "%TARGET%\plugins" /E /XD node_modules /R:2 /W:2 /NFL /NDL /NP

echo.
echo ==================== 部署完成 ====================
echo.
echo 项目已部署到：%TARGET%
echo.
dir "%TARGET%" /B
echo.
pause
