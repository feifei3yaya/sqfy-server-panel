#!/usr/bin/env pwsh
# -*- coding: utf-8 -*-
<#
.SYNOPSIS
    Squad 服务器管理面板远程部署脚本
.DESCRIPTION
    通过 SSH/SFTP 将项目文件上传到远程服务器并配置环境
#>

$ErrorActionPreference = "Stop"

# 服务器配置
$HOST_IP = "43.138.188.183"
$USERNAME = "Administrator"
$PASSWORD = "@Kw123456789"
$REMOTE_BASE_DIR = "D:\sqfy-panel"

# 本地项目根目录
$LOCAL_BASE_DIR = Split-Path -Parent $PSScriptRoot | Split-Path -Parent

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Squad 面板远程部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器：$HOST_IP" -ForegroundColor Yellow
Write-Host "用户：$USERNAME" -ForegroundColor Yellow
Write-Host "目标目录：$REMOTE_BASE_DIR" -ForegroundColor Yellow
Write-Host "本地目录：$LOCAL_BASE_DIR" -ForegroundColor Yellow
Write-Host ""

# 创建 SSH 连接配置
$pass = ConvertTo-SecureString $PASSWORD -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($USERNAME, $pass)

Write-Host "[1/6] 创建远程目录结构..." -ForegroundColor Green
$sshCmd = @"
cd D:
mkdir sqfy-panel
cd sqfy-panel
mkdir server
mkdir client
mkdir config
mkdir docs
mkdir plugins
mkdir logs
echo 目录创建完成
"@

Write-Host "执行远程命令..."
# 这里需要使用 Plink 或其他 SSH 工具
# 由于 Windows 原生 SSH 限制，我们使用分段命令

Write-Host ""
Write-Host "[提示] 由于 Windows SSH 限制，请手动执行以下命令：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 在 SSH 终端执行:" -ForegroundColor Cyan
Write-Host "   cd D:" -ForegroundColor White
Write-Host "   mkdir sqfy-panel" -ForegroundColor White
Write-Host "   cd sqfy-panel" -ForegroundColor White
Write-Host "   mkdir server client config docs plugins logs" -ForegroundColor White
Write-Host ""
Write-Host "2. 使用 Robocopy 复制文件:" -ForegroundColor Cyan
Write-Host "   robocopy `"$LOCAL_BASE_DIR\server`" `"$REMOTE_BASE_DIR\server`" /E /XD node_modules dist build .git .vscode /XF *.log" -ForegroundColor White
Write-Host "   robocopy `"$LOCAL_BASE_DIR\client`" `"$REMOTE_BASE_DIR\client`" /E /XD node_modules dist build .git .vscode" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署脚本完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
