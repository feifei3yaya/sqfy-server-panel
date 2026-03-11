# 上传并配置数据库备份脚本
$SERVER_IP = "43.138.188.183"
$USERNAME = "Administrator"
$PASSWORD = "@Kw123456789"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  部署数据库备份脚本" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 连接 SSH
Write-Host "[1/4] 连接服务器..." -ForegroundColor Green
$client = New-Object System.Net.Sockets.TcpClient
$client.Connect($SERVER_IP, 22)
$client.Close()
Write-Host "✅ 服务器连接正常" -ForegroundColor Green

# 使用 SCP 上传文件
Write-Host "[2/4] 上传备份脚本..." -ForegroundColor Green
$localScript = "d:\SQFY-v1.0.0.0\scripts\backup-db.ps1"
$remotePath = "D:/sqfy-panel/scripts/backup-db.ps1"

# 使用 PowerShell SCP
$scpCommand = "scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `"$localScript`" `"${USERNAME}@${SERVER_IP}:'$remotePath'`""
Invoke-Expression $scpCommand
Write-Host "✅ 脚本已上传" -ForegroundColor Green

# 执行一次测试备份
Write-Host "[3/4] 执行测试备份..." -ForegroundColor Green
$testCommand = "ssh ${USERNAME}@${SERVER_IP} `"powershell -ExecutionPolicy Bypass -File D:/sqfy-panel/scripts/backup-db.ps1`""
Invoke-Expression $testCommand
Write-Host "✅ 测试备份完成" -ForegroundColor Green

# 创建计划任务
Write-Host "[4/4] 创建自动备份计划任务..." -ForegroundColor Green
$taskCommand = @"
ssh ${USERNAME}@${SERVER_IP} "schtasks /create /tn 'SQFY Database Backup' /tr 'powershell -ExecutionPolicy Bypass -File D:\sqfy-panel\scripts\backup-db.ps1' /sc daily /st 03:00 /ru SYSTEM /f"
"@
Invoke-Expression $taskCommand
Write-Host "✅ 计划任务已创建（每天凌晨3点自动备份）" -ForegroundColor Green

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ✅ 数据库备份配置完成！" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "备份信息:" -ForegroundColor Yellow
Write-Host "  - 备份目录: D:\sqfy-panel\backups" -ForegroundColor White
Write-Host "  - 备份脚本: D:\sqfy-panel\scripts\backup-db.ps1" -ForegroundColor White
Write-Host "  - 备份时间: 每天凌晨 3:00" -ForegroundColor White
Write-Host "  - 保留策略: 保留最近 7 天的备份" -ForegroundColor White
Write-Host ""
