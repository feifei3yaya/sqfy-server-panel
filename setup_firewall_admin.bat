@echo off
:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------

echo [INFO] Setting up firewall rules with Administrator privileges...

netsh advfirewall firewall delete rule name="SQFY Panel - HTTP" >nul 2>&1
netsh advfirewall firewall add rule name="SQFY Panel - HTTP" dir=in action=allow protocol=TCP localport=8000

netsh advfirewall firewall delete rule name="Web HTTP" >nul 2>&1
netsh advfirewall firewall add rule name="Web HTTP" dir=in action=allow protocol=TCP localport=80

netsh advfirewall firewall delete rule name="Web HTTPS" >nul 2>&1
netsh advfirewall firewall add rule name="Web HTTPS" dir=in action=allow protocol=TCP localport=443

echo [SUCCESS] Firewall rules added successfully!
echo.
echo [IMPORTANT] If you are using a Cloud Server (Tencent/Aliyun/AWS):
echo Please ensure port 8000 is also allowed in your Cloud Console Security Group (Safe Group).
echo.
pause
