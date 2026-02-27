@echo off
setlocal enabledelayedexpansion

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker could not be found. Please install Docker first.
    exit /b 1
)

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please update JWT_SECRET in .env file manually for security!
)

echo Building and starting containers...
docker-compose up -d --build

echo Deployment complete! Access the panel at http://localhost
pause
