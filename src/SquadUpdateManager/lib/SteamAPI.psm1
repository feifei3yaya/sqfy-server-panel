# SteamAPI.psm1

function Get-LocalBuildID {
    param (
        [string]$ServerPath,
        [string]$AppId
    )
    $ManifestPath = Join-Path $ServerPath "steamapps\appmanifest_$AppId.acf"
    
    if (-not (Test-Path $ManifestPath)) {
        Write-Error "AppManifest file not found at: $ManifestPath"
        return $null
    }
    
    $Content = Get-Content -Path $ManifestPath -Raw
    if ($Content -match '"buildid"\s+"(\d+)"') {
        return $matches[1]
    } else {
        Write-Error "Could not parse buildid from local manifest."
        return $null
    }
}

function Get-RemoteBuildID {
    param (
        [string]$SteamCmdPath,
        [string]$AppId
    )
    
    # Run SteamCMD to get info
    # Use -noprofile to avoid loading user profile
    # Use -ExecutionPolicy Bypass for script running
    
    $TempFile = Join-Path ([System.IO.Path]::GetTempPath()) "steamcmd_output_$AppId.txt"
    
    # Prepare command
    $SteamCmdArgs = "+login anonymous +app_info_update 1 +app_info_print $AppId +quit"
    
    Write-Host "Running SteamCMD to check remote version..." -ForegroundColor Cyan
    
    # Execute SteamCMD and capture output
    try {
        $Process = Start-Process -FilePath $SteamCmdPath -ArgumentList $SteamCmdArgs -NoNewWindow -PassThru -RedirectStandardOutput $TempFile -Wait
        
        if ($Process.ExitCode -ne 0) {
            Write-Error "SteamCMD exited with error code: $($Process.ExitCode)"
            return $null
        }
        
        # Parse output
        $Content = Get-Content -Path $TempFile -Raw
        
        # Look for public branch buildid
        # Structure is roughly: "branches" { "public" { "buildid" "123" ... } }
        # Simplified regex for demo purposes: look for "public" followed by "buildid" within reasonable distance
        # A more robust parser would be needed for production JSON-like structure
        
        # Extract "branches" block
        if ($Content -match '"branches"\s*\{([\s\S]*?)\}') {
            $BranchesBlock = $matches[1]
            # Extract "public" block
            if ($BranchesBlock -match '"public"\s*\{([\s\S]*?)\}') {
                $PublicBlock = $matches[1]
                # Extract buildid
                if ($PublicBlock -match '"buildid"\s+"(\d+)"') {
                    return $matches[1]
                }
            }
        }
        
        Write-Error "Could not parse remote buildid from SteamCMD output."
        return $null
        
    } catch {
        Write-Error "Failed to execute SteamCMD: $_"
        return $null
    } finally {
        if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
    }
}

function Update-GameServer {
    param (
        [string]$SteamCmdPath,
        [string]$ServerPath,
        [string]$AppId
    )
    
    $UpdateArgs = "+login anonymous +force_install_dir `"$ServerPath`" +app_update $AppId validate +quit"
    
    Write-Host "Starting update process..." -ForegroundColor Cyan
    Start-Process -FilePath $SteamCmdPath -ArgumentList $UpdateArgs -Wait -NoNewWindow
}

Export-ModuleMember -Function Get-LocalBuildID, Get-RemoteBuildID, Update-GameServer
