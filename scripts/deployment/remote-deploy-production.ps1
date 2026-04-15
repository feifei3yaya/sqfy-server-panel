$ErrorActionPreference = 'Stop'

$root = 'D:\sqfy-panel'
$serverDir = Join-Path $root 'server'
$clientDir = Join-Path $root 'client'

Set-Location $serverDir
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

Set-Location $clientDir
npm install
$env:VITE_API_URL = 'http://sq-fy.cn:3000'
$env:VITE_SOCKET_URL = 'http://sq-fy.cn:3000'
npm run build
Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
Remove-Item Env:VITE_SOCKET_URL -ErrorAction SilentlyContinue

New-NetFirewallRule -DisplayName 'SQFY Web 80' -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
New-NetFirewallRule -DisplayName 'SQFY API 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null

Set-Location $root
try {
  pm2 delete all
} catch {
}
pm2 start ecosystem.config.js --update-env
pm2 save

Invoke-WebRequest -Uri 'http://127.0.0.1/' -UseBasicParsing | Out-Null
Invoke-WebRequest -Uri 'http://127.0.0.1:3000/health' -UseBasicParsing | Out-Null
