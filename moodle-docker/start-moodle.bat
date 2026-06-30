@echo off
echo Starting Moodle via Docker...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------
    echo ERROR: Docker is not running or not installed correctly!
    echo Please open 'Docker Desktop' from your Start Menu and try again.
    echo ----------------------------------------------------
    pause
    exit /b %errorlevel%
)
echo.
echo Moodle is starting up! It might take 1-2 minutes.
echo Once it is ready, you can access it at: http://localhost
echo.
pause
