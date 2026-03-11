function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO",
        [string]$LogFile = "SquadUpdateManager.log"
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    # Write to console
    switch ($Level) {
        "ERROR" { Write-Host $LogEntry -ForegroundColor Red }
        "WARN"  { Write-Host $LogEntry -ForegroundColor Yellow }
        "INFO"  { Write-Host $LogEntry -ForegroundColor Green }
        default { Write-Host $LogEntry }
    }
    
    # Write to file (append)
    try {
        Add-Content -Path $LogFile -Value $LogEntry -ErrorAction Stop
    } catch {
        Write-Host "Failed to write to log file: $_" -ForegroundColor Red
    }
}

Export-ModuleMember -Function Write-Log
