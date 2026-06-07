@echo off
REM ========================================================================
REM  MEETING MINUTES AI - COMPLETE SETUP AND RUN SCRIPT
REM ========================================================================
REM
REM This script will:
REM  1. Verify Python installation
REM  2. Install all dependencies
REM  3. Initialize the database
REM  4. Start the backend server
REM
REM ========================================================================

cls
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   MEETING MINUTES AI - SETUP AND RUN
echo ============================================================
echo.
echo This script will set up and run your backend.
echo Keep this window open while the backend runs.
echo.

REM ========================================================================
REM STEP 1: Verify Python
REM ========================================================================
echo [STEP 1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.9+ from https://python.org
    echo During installation, CHECK "Add Python to PATH"
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo OK - Found %PYTHON_VERSION%
echo.

REM ========================================================================
REM STEP 2: Verify pip
REM ========================================================================
echo [STEP 2/5] Checking pip...
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pip not found!
    echo Trying python -m pip...
    python -m pip --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: pip installation failed
        pause
        exit /b 1
    )
)
echo OK - pip is available
echo.

REM ========================================================================
REM STEP 3: Install Dependencies
REM ========================================================================
echo [STEP 3/5] Installing Python dependencies...
echo This may take 10-15 minutes on first run...
echo.
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Dependency installation failed!
    echo Try: pip install --user -r requirements.txt
    pause
    exit /b 1
)
echo.
echo OK - All dependencies installed successfully!
echo.

REM ========================================================================
REM STEP 4: Initialize Database
REM ========================================================================
echo [STEP 4/5] Initializing database...
python -c "from app.db.database import init_db; init_db(); print('OK - Database initialized')" 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Database initialization may have issues
    echo But this might be OK - continuing...
)
echo.

REM ========================================================================
REM STEP 5: Start Backend Server
REM ========================================================================
echo [STEP 5/5] Starting backend server...
echo.
echo ============================================================
echo   IMPORTANT: MAKE SURE OLLAMA IS RUNNING
echo ============================================================
echo Before starting the backend, make sure Ollama is running:
echo   1. Open a NEW command prompt or PowerShell window
echo   2. Run: ollama serve
echo   3. You should see: "Listening on 127.0.0.1:11434"
echo   4. Keep that window open
echo ============================================================
echo.
timeout /t 5 /nobreak
echo.
echo Starting backend server on http://localhost:8000
echo Watch for message: "✅ Ollama is reachable..."
echo.
echo To stop the server, press CTRL+C
echo.
pause

REM Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM If we get here, the server was stopped
echo.
echo Backend server stopped.
pause
