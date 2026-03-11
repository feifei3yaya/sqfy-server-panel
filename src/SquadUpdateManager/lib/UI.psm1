# UI.psm1 - Windows Forms UI Module

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-UpdatePrompt {
    param (
        [string]$CurrentVersion,
        [string]$NewVersion,
        [string]$UpdateContent = "Bug fixes and performance improvements."
    )
    
    # Create Form
    $Form = New-Object System.Windows.Forms.Form
    $Form.Text = "Squad Server Update Available"
    $Form.Size = New-Object System.Drawing.Size(400, 300)
    $Form.StartPosition = "CenterScreen"
    $Form.FormBorderStyle = "FixedDialog"
    $Form.MaximizeBox = $false
    
    # Label: Title
    $LabelTitle = New-Object System.Windows.Forms.Label
    $LabelTitle.Text = "New Update Found!"
    $LabelTitle.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $LabelTitle.AutoSize = $true
    $LabelTitle.Location = New-Object System.Drawing.Point(20, 20)
    $Form.Controls.Add($LabelTitle)
    
    # Label: Versions
    $LabelVer = New-Object System.Windows.Forms.Label
    $LabelVer.Text = "Current Version: $CurrentVersion`nNew Version:     $NewVersion"
    $LabelVer.AutoSize = $true
    $LabelVer.Location = New-Object System.Drawing.Point(20, 60)
    $Form.Controls.Add($LabelVer)
    
    # Textbox: Content
    $TxtContent = New-Object System.Windows.Forms.TextBox
    $TxtContent.Multiline = $true
    $TxtContent.ReadOnly = $true
    $TxtContent.ScrollBars = "Vertical"
    $TxtContent.Text = $UpdateContent
    $TxtContent.Location = New-Object System.Drawing.Point(20, 100)
    $TxtContent.Size = New-Object System.Drawing.Size(340, 100)
    $Form.Controls.Add($TxtContent)
    
    # Button: Update Now
    $BtnUpdate = New-Object System.Windows.Forms.Button
    $BtnUpdate.Text = "Update Now"
    $BtnUpdate.Location = New-Object System.Drawing.Point(50, 220)
    $BtnUpdate.Size = New-Object System.Drawing.Size(120, 30)
    $BtnUpdate.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $Form.Controls.Add($BtnUpdate)
    
    # Button: Remind Later
    $BtnLater = New-Object System.Windows.Forms.Button
    $BtnLater.Text = "Remind Later"
    $BtnLater.Location = New-Object System.Drawing.Point(210, 220)
    $BtnLater.Size = New-Object System.Drawing.Size(120, 30)
    $BtnLater.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $Form.Controls.Add($BtnLater)
    
    # Show Dialog
    $Result = $Form.ShowDialog()
    
    if ($Result -eq [System.Windows.Forms.DialogResult]::OK) {
        return "UPDATE"
    } else {
        return "LATER"
    }
}

Export-ModuleMember -Function Show-UpdatePrompt
