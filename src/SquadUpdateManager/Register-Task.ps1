# Register-Task.ps1
# Helper script to register the update manager as a scheduled task

$ScriptPath = Join-Path $PSScriptRoot "SquadUpdateManager.ps1"
$TaskName = "SquadServerUpdateCheck"
$IntervalMinutes = 60

# Check if task exists
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task: $TaskName"
}

# Create Trigger (Hourly)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)

# Create Action
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""

# Register Task
Register-ScheduledTask -TaskName $TaskName -Trigger $Trigger -Action $Action -Description "Checks for Squad Server updates hourly." -User "System" -RunLevel Highest

Write-Host "Task '$TaskName' registered successfully to run every $IntervalMinutes minutes."
