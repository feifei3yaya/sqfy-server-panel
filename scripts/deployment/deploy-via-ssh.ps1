# Squad 面板远程部署脚本
# 使用 PowerShell 和 SSH 完成部署

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Squad 面板远程部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER_IP = "43.138.188.183"
$USERNAME = "Administrator"
$PASSWORD = "@Kw123456789"
$LOCAL_PACKAGE = "D:\SQFY-v1.0.0.0\deploy-package"
$REMOTE_DIR = "D:\sqfy-panel"

Write-Host "[1/10] 创建 SSH 连接..." -ForegroundColor Green

# 创建 SSH 连接字符串
$sshCmd = "ssh -o StrictHostKeyChecking=no $USERNAME@$SERVER_IP"

Write-Host "[2/10] 在服务器上创建部署目录..." -ForegroundColor Green
Invoke-Expression "$sshCmd `"cd D: && if exist sqfy-panel (echo 目录已存在) && mkdir sqfy-panel`""

Write-Host "[3/10] 创建子目录..." -ForegroundColor Green
Invoke-Expression "$sshCmd `"cd D:\sqfy-panel && mkdir server client config docs plugins logs`""

Write-Host "[4/10] 使用 robocopy 复制文件（需要手动操作）" -ForegroundColor Yellow
Write-Host ""
Write-Host "由于 Windows SSH 限制，请使用以下方法之一上传文件:" -ForegroundColor Yellow
Write-Host ""
Write-Host "方法 1: 使用 WinSCP (推荐)" -ForegroundColor Cyan
Write-Host "  1. 下载 WinSCP: https://winscp.net" -ForegroundColor White
Write-Host "  2. 连接到 $SERVER_IP" -ForegroundColor White
Write-Host "  3. 上传 $LOCAL_PACKAGE 到 $REMOTE_DIR" -ForegroundColor White
Write-Host ""
Write-Host "方法 2: 使用 Git Bash SCP" -ForegroundColor Cyan
Write-Host "  scp -r $LOCAL_PACKAGE/* $USERNAME@$SERVER_IP`:`"$REMOTE_DIR/`"" -ForegroundColor White
Write-Host ""

Write-Host "[5/10] 等待文件上传完成后，执行以下命令..." -ForegroundColor Green
Write-Host ""
Write-Host "在 PowerShell 中执行:" -ForegroundColor Cyan
Write-Host "ssh $USERNAME@$SERVER_IP" -ForegroundColor White
Write-Host "然后输入密码：$PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "连接后执行:" -ForegroundColor Cyan
Write-Host "  cd D:\sqfy-panel\server" -ForegroundColor White
Write-Host "  npm install --production" -ForegroundColor White
Write-Host "  cd ..\client" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  cd ..\server" -ForegroundColor White
Write-Host "  notepad .env" -ForegroundColor White
Write-Host "  (配置环境变量)" -ForegroundColor White
Write-Host "  npx prisma migrate deploy" -ForegroundColor White
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npm install -g pm2" -ForegroundColor White
Write-Host "  cd .." -ForegroundColor White
Write-Host "  pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
Write-Host "  pm2 startup" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署脚本完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
