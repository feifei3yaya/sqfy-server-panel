# UnitTests.ps1
# Simple Test Harness for SquadUpdateManager

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$LibDir = Join-Path $ProjectRoot "lib"

Import-Module (Join-Path $LibDir "SteamAPI.psm1")
Import-Module (Join-Path $LibDir "Logger.psm1")

Write-Host "Running Unit Tests..." -ForegroundColor Cyan

# Test 1: Get-LocalBuildID
Write-Host "Test 1: Get-LocalBuildID"
$TestManifestPath = Join-Path $ProjectRoot "steamapps\appmanifest_403240.acf"
$TestContent = @"
"AppState"
{
    "appid"     "403240"
    "buildid"   "123456"
}
"@
# Ensure directory exists
if (-not (Test-Path (Join-Path $ProjectRoot "steamapps"))) {
    New-Item -Path (Join-Path $ProjectRoot "steamapps") -ItemType Directory | Out-Null
}
Set-Content -Path $TestManifestPath -Value $TestContent

$Result = Get-LocalBuildID -ServerPath $ProjectRoot -AppId "403240"
if ($Result -eq "123456") {
    Write-Host "PASS: Correctly parsed buildid '123456'" -ForegroundColor Green
} else {
    Write-Host "FAIL: Expected '123456', got '$Result'" -ForegroundColor Red
}

# Cleanup
Remove-Item -Path $TestManifestPath -Force
Remove-Item -Path (Join-Path $ProjectRoot "steamapps") -Force

# Test 2: UI Module Load
Write-Host "Test 2: UI Module Load"
try {
    Import-Module (Join-Path $LibDir "UI.psm1")
    Write-Host "PASS: UI Module loaded successfully." -ForegroundColor Green
} catch {
    Write-Host "FAIL: UI Module failed to load: $_" -ForegroundColor Red
}

Write-Host "Tests Completed."
