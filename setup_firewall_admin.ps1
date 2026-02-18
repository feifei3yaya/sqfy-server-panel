$rules = @(
    @{Name="SQFY Panel - HTTP"; Protocol="TCP"; LocalPort="8000"},
    @{Name="Web HTTP"; Protocol="TCP"; LocalPort="80"},
    @{Name="Web HTTPS"; Protocol="TCP"; LocalPort="443"},
    @{Name="Squad Server - Game Port"; Protocol="UDP"; LocalPort="7787"},
    @{Name="Squad Server - Query Port"; Protocol="UDP"; LocalPort="27165"},
    @{Name="Squad Server - RCON Port"; Protocol="TCP"; LocalPort="27015"},
    @{Name="Squad Server - Steam Port"; Protocol="UDP"; LocalPort="27036"},
    @{Name="Squad Server - Steam P2P"; Protocol="UDP"; LocalPort="27037"}
)

$scriptBlock = {
    param($rules)
    foreach ($rule in $rules) {
        Write-Host "Setting up rule: $($rule.Name)"
        # Remove existing rule to avoid duplicates
        netsh advfirewall firewall delete rule name="$($rule.Name)" | Out-Null
        # Add new rule
        netsh advfirewall firewall add rule name="$($rule.Name)" dir=in action=allow protocol="$($rule.Protocol)" localport="$($rule.LocalPort)"
    }
    Read-Host "Press Enter to close..."
}

# Run as Administrator
Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", "& { $scriptBlock }" -Verb RunAs
