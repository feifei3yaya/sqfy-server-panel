# SquadUpdateManager.ps1
# Main Script for Squad Server Update Management

# Load Modules
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module (Join-Path $ScriptDir "lib\Logger.psm1")
Import-Module (Join-Path $ScriptDir "lib\SteamAPI.psm1")
Import-Module (Join-Path $ScriptDir "lib\UI.psm1")

# Load Config
$ConfigPath = Join-Path $ScriptDir "config.json"
if (-not (Test-Path $ConfigPath)) {
    Write-Error "Config file not found at: $ConfigPath"
    exit 1
}
$Config = Get-Content -Raw $ConfigPath | ConvertFrom-Json

# Helper Functions
function Stop-Server {
    param ([string]$ProcessName)
    Write-Log "Stopping server process: $ProcessName" "INFO"
    $Process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($Process) {
        Stop-Process -Name $ProcessName -Force
        Start-Sleep -Seconds 5
        Write-Log "Server stopped." "INFO"
    } else {
        Write-Log "Server process not running." "INFO"
    }
}

function Start-Server {
    param ([string]$ServerPath)
    Write-Log "Starting server from: $ServerPath" "INFO"
    # Assuming start script is in the root of server path
    $StartScript = Join-Path $ServerPath "Start_Squad_Server.bat"
    if (Test-Path $StartScript) {
        Start-Process -FilePath $StartScript
        Write-Log "Start script executed." "INFO"
    } else {
        Write-Log "Start script not found: $StartScript" "ERROR"
    }
}

# Main Logic
Write-Log "Starting Squad Update Manager..." "INFO"

# 1. Get Local Version
$LocalVer = Get-LocalBuildID -ServerPath $Config.ServerPath -AppId $Config.AppId
if (-not $LocalVer) {
    Write-Log "Failed to get local version. Aborting." "ERROR"
    exit 1
}
Write-Log "Local Version: $LocalVer" "INFO"

# 2. Get Remote Version
$RemoteVer = Get-RemoteBuildID -SteamCmdPath $Config.SteamCmdPath -AppId $Config.AppId
if (-not $RemoteVer) {
    Write-Log "Failed to get remote version. Check internet connection." "ERROR"
    exit 1
}
Write-Log "Remote Version: $RemoteVer" "INFO"

# 3. Compare
if ($LocalVer -ne $RemoteVer) {
    Write-Log "Update Available! ($LocalVer -> $RemoteVer)" "WARN"
    
    # 4. Prompt UI
    $Choice = Show-UpdatePrompt -CurrentVersion $LocalVer -NewVersion $RemoteVer
    
    if ($Choice -eq "UPDATE") {
        Write-Log "User chose to update immediately." "INFO"
        
        # Stop Server
        Stop-Server -ProcessName $Config.ServerProcessName
        
        # Update
        Write-Log "Starting SteamCMD update..." "INFO"
        Update-GameServer -SteamCmdPath $Config.SteamCmdPath -ServerPath $Config.ServerPath -AppId $Config.AppId
        
        # Verify Update
        $NewLocalVer = Get-LocalBuildID -ServerPath $Config.ServerPath -AppId $Config.AppId
        if ($NewLocalVer -eq $RemoteVer) {
            Write-Log "Update successful! New version: $NewLocalVer" "INFO"
            
            # Restart Server
            Start-Server -ServerPath $Config.ServerPath
        } else {
            Write-Log "Update verification failed. Still on version $NewLocalVer" "ERROR"
        }
        
    } else {
        Write-Log "User chose to remind later." "INFO"
        # Schedule task logic could go here, or rely on the scheduled task re-running this script
    }
} else {
    Write-Log "Server is up to date." "INFO"
}

Write-Log "Check completed." "INFO"
exit 0
