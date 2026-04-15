
# 一键部署脚本：打包 -> 上传 -> 远程执行
# 注意：需要 SSH 免密登录或在提示时输入密码

$ErrorActionPreference = "Stop"

$SERVER_IP = "43.138.188.183"
$USERNAME = "Administrator"
$REMOTE_TEMP_DIR = "D:\deploy-temp"

# 1. 检查 SSH 连接
Write-Host "正在连接服务器 $SERVER_IP ..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no $USERNAME@$SERVER_IP "echo SSH连接成功"
if ($LASTEXITCODE -ne 0) {
    Write-Host "无法连接到服务器，请检查网络或密码。" -ForegroundColor Red
    exit 1
}




# 2. 上传文件
Write-Host "正在上传部署文件..." -ForegroundColor Cyan
ssh $USERNAME@$SERVER_IP "if not exist $REMOTE_TEMP_DIR mkdir $REMOTE_TEMP_DIR"
scp -r D:\SQFY-v1.0.0.0\deploy-package\setup-nginx.ps1 $USERNAME@$SERVER_IP`:$REMOTE_TEMP_DIR\
scp -r D:\SQFY-v1.0.0.0\deploy-package\nginx.conf $USERNAME@$SERVER_IP`:$REMOTE_TEMP_DIR\

# 3. 远程执行部署脚本
Write-Host "正在远程执行部署脚本..." -ForegroundColor Cyan
ssh $USERNAME@$SERVER_IP "powershell -ExecutionPolicy Bypass -File $REMOTE_TEMP_DIR\setup-nginx.ps1"

Write-Host "部署操作完成！" -ForegroundColor Green
