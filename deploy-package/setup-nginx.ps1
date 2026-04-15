
# 设置 TLS 1.2，防止下载失败
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$nginxUrl = "http://nginx.org/download/nginx-1.24.0.zip"
$nginxPath = "D:\nginx"
$winAcmeUrl = "https://github.com/win-acme/win-acme/releases/download/v2.2.8.1635/win-acme.v2.2.8.1635.x64.pluggable.zip"
$winAcmePath = "D:\win-acme"
$winSwUrl = "https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe"

# 1. 安装 Nginx
if (-not (Test-Path $nginxPath)) {
    Write-Host "正在下载 Nginx..."
    Invoke-WebRequest -Uri $nginxUrl -OutFile "nginx.zip"
    Write-Host "正在解压 Nginx..."
    Expand-Archive -Path "nginx.zip" -DestinationPath "D:\"
    # 重命名解压后的文件夹 (通常是 nginx-1.24.0)
    $extractedFolder = Get-ChildItem "D:\" | Where-Object { $_.Name -like "nginx-*" } | Select-Object -First 1
    Rename-Item -Path $extractedFolder.FullName -NewName "nginx"
    Remove-Item "nginx.zip"
    Write-Host "Nginx 安装完成。"
} else {
    Write-Host "Nginx 已存在，跳过安装。"
}

# 2. 配置 Nginx
Write-Host "正在配置 Nginx..."
Copy-Item -Path "nginx.conf" -Destination "$nginxPath\conf\nginx.conf" -Force
Write-Host "配置文件已更新。"

# 3. 安装 win-acme
if (-not (Test-Path $winAcmePath)) {
    Write-Host "正在下载 win-acme..."
    New-Item -ItemType Directory -Force -Path $winAcmePath
    Invoke-WebRequest -Uri $winAcmeUrl -OutFile "win-acme.zip"
    Write-Host "正在解压 win-acme..."
    Expand-Archive -Path "win-acme.zip" -DestinationPath $winAcmePath
    Remove-Item "win-acme.zip"
    Write-Host "win-acme 安装完成。"
} else {
    Write-Host "win-acme 已存在，跳过安装。"
}

# 4. 下载 WinSW (用于注册服务)
if (-not (Test-Path "$nginxPath\nginx-service.exe")) {
    Write-Host "正在下载 WinSW..."
    Invoke-WebRequest -Uri $winSwUrl -OutFile "$nginxPath\nginx-service.exe"
    
    # 创建服务配置文件
    $xmlContent = @"
<service>
  <id>nginx</id>
  <name>Nginx</name>
  <description>Nginx Web Server</description>
  <logpath>$nginxPath\logs</logpath>
  <logmode>roll</logmode>
  <depend></depend>
  <executable>$nginxPath\nginx.exe</executable>
  <stopexecutable>$nginxPath\nginx.exe -s stop</stopexecutable>
</service>
"@
    Set-Content -Path "$nginxPath\nginx-service.xml" -Value $xmlContent
    Write-Host "WinSW 配置完成。"
}

# 5. 自动申请证书 (尝试)
Write-Host "尝试自动申请证书..."
$wacsExe = "$winAcmePath\wacs.exe"
if (Test-Path $wacsExe) {
    # 确保 WebRoot 存在
    New-Item -ItemType Directory -Force -Path "$nginxPath\html"
    New-Item -ItemType Directory -Force -Path "$nginxPath\cert"

    # 启动 Nginx 以便进行验证 (如果尚未启动)
    if (-not (Get-Process nginx -ErrorAction SilentlyContinue)) {
        Write-Host "启动 Nginx 进行验证..."
        Start-Process "$nginxPath\nginx.exe" -WorkingDirectory $nginxPath
        Start-Sleep -Seconds 5
    }

    # 构造命令参数
    # --target manual: 手动输入主机名
    # --host: 域名
    # --validation filesystem: 文件验证
    # --webroot: 网站根目录
    # --store pemfiles: 保存为 PEM 文件
    # --pemfilespath: 证书保存路径
    $wacsArgs = "--target manual --host www.sq-fy.cn,sq-fy.cn --validation filesystem --webroot `"$nginxPath\html`" --store pemfiles --pemfilespath `"$nginxPath\cert`" --accepttos --emailadminonrenewal --emailaddress admin@sq-fy.cn"
    
    Write-Host "执行命令: $wacsExe $wacsArgs"
    Start-Process -FilePath $wacsExe -ArgumentList $wacsArgs -Wait -NoNewWindow
    
    # 检查证书是否生成
    if (Test-Path "$nginxPath\cert\*-crt.pem") {
        Write-Host "证书申请成功！"
        
        # 自动修改 nginx.conf
        $certFile = (Get-ChildItem "$nginxPath\cert\*-crt.pem" | Select-Object -First 1).Name
        $keyFile = (Get-ChildItem "$nginxPath\cert\*-key.pem" | Select-Object -First 1).Name
        
        $confPath = "$nginxPath\conf\nginx.conf"
        $confContent = Get-Content $confPath -Raw
        $confContent = $confContent -replace "ssl_certificate\s+cert/fullchain.pem;", "ssl_certificate      ../cert/$certFile;"
        $confContent = $confContent -replace "ssl_certificate_key\s+cert/privkey.pem;", "ssl_certificate_key  ../cert/$keyFile;"
        Set-Content -Path $confPath -Value $confContent
        
        Write-Host "nginx.conf 已更新为使用新证书。"
        
        # 重载 Nginx
        Write-Host "重载 Nginx..."
        Start-Process "$nginxPath\nginx.exe" -ArgumentList "-s reload" -WorkingDirectory $nginxPath
    } else {
        Write-Host "证书申请可能失败，请手动检查。" -ForegroundColor Red
    }
}

# 6. 安装并启动服务
if (Test-Path "$nginxPath\nginx-service.exe") {
    Write-Host "注册并启动 Nginx 服务..."
    Start-Process "$nginxPath\nginx-service.exe" -ArgumentList "install" -WorkingDirectory $nginxPath -Wait
    Start-Process "$nginxPath\nginx-service.exe" -ArgumentList "start" -WorkingDirectory $nginxPath -Wait
    Write-Host "Nginx 服务已启动。"
}

Write-Host "--------------------------------------------------"
Write-Host "自动化部署流程结束。"
Write-Host "请访问 https://www.sq-fy.cn 验证。"
Write-Host "--------------------------------------------------"
