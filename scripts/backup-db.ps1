# Squad 面板数据库备份脚本
# 自动备份 SQLite 数据库并保留最近 7 天的备份

param(
    [string]$BackupDir = "D:\sqfy-panel\backups",
    [string]$DbFile = "D:\sqfy-panel\server\prisma\dev.db",
    [int]$KeepDays = 7
)

# 创建备份目录
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "创建备份目录: $BackupDir" -ForegroundColor Green
}

# 生成时间戳
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "dev_$timestamp.db"

# 执行备份
Write-Host "正在备份数据库..." -ForegroundColor Yellow
try {
    Copy-Item -Path $DbFile -Destination $backupFile -Force
    $fileSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "备份完成: $backupFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
} catch {
    Write-Host "备份失败: $_" -ForegroundColor Red
    exit 1
}

# 清理旧备份
Write-Host "清理 $KeepDays 天前的旧备份..." -ForegroundColor Yellow
$cutoffDate = (Get-Date).AddDays(-$KeepDays)
$oldBackups = Get-ChildItem -Path $BackupDir -Filter "*.db" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

$deletedCount = 0
foreach ($backup in $oldBackups) {
    Remove-Item -Path $backup.FullName -Force
    $deletedCount++
}

if ($deletedCount -gt 0) {
    Write-Host "已删除 $deletedCount 个旧备份文件" -ForegroundColor Green
} else {
    Write-Host "没有需要清理的旧备份" -ForegroundColor Gray
}

# 显示备份统计
$allBackups = Get-ChildItem -Path $BackupDir -Filter "*.db" | Sort-Object LastWriteTime -Descending
$totalSize = ($allBackups | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "`n备份统计:" -ForegroundColor Cyan
Write-Host "  备份文件总数: $($allBackups.Count)" -ForegroundColor White
Write-Host "  总占用空间: $([math]::Round($totalSize, 2)) MB" -ForegroundColor White
Write-Host "  最新备份: $($allBackups[0].Name)" -ForegroundColor White

Write-Host "`n数据库备份完成!" -ForegroundColor Green
