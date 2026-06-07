@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   MEETING MINUTES AI - FRONTEND SETUP
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [STEP 1] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully
) else (
    echo [STEP 1] Dependencies already installed, skipping npm install
)

echo.
echo ========================================
echo [STEP 2] Starting frontend dev server...
echo ========================================
echo.
echo Frontend will start on: http://localhost:5173
echo Backend API: http://localhost:8000
echo.
echo Press CTRL+C to stop
echo.

REM Start the dev server
call npm run dev

if !errorlevel! equ 0 (
    echo.
    echo ✅ Frontend started successfully!
) else (
    echo.
    echo ❌ Failed to start frontend
    echo Check the error message above
    pause
    exit /b 1
)

pause
