@echo off
REM Dependency Verification and Project Setup Script for Windows

cls
echo.
echo ============================================================
echo   MEETING MINUTES AI - DEPENDENCY VERIFICATION
echo ============================================================
echo.

REM Check Python
echo [1/8] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.9+
    pause
    exit /b 1
)
echo OK - Python found
echo.

REM Check pip
echo [2/8] Checking pip...
pip --version
if %errorlevel% neq 0 (
    echo ERROR: pip not found
    pause
    exit /b 1
)
echo OK - pip found
echo.

REM Check .env
echo [3/8] Checking configuration file...
if exist .env (
    echo OK - .env exists
) else (
    echo Creating .env from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo OK - .env created
    ) else (
        echo ERROR: .env.example not found
        pause
        exit /b 1
    )
)
echo.

REM Check requirements.txt
echo [4/8] Checking requirements.txt...
if exist requirements.txt (
    echo OK - requirements.txt found
) else (
    echo ERROR: requirements.txt not found
    pause
    exit /b 1
)
echo.

REM Install/Update dependencies
echo [5/8] Installing dependencies...
echo This may take 10-15 minutes on first run...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK - Dependencies installed
echo.

REM Verify key packages
echo [6/8] Verifying installed packages...
python -c "import fastapi; print('  OK - FastAPI')" || (echo  ERROR - FastAPI, && pause && exit /b 1)
python -c "import uvicorn; print('  OK - Uvicorn')" || (echo  ERROR - Uvicorn, && pause && exit /b 1)
python -c "import sqlalchemy; print('  OK - SQLAlchemy')" || (echo  ERROR - SQLAlchemy, && pause && exit /b 1)
python -c "import reportlab; print('  OK - ReportLab')" || (echo  ERROR - ReportLab, && pause && exit /b 1)
echo.

REM Initialize database
echo [7/8] Initializing database...
python -c "from app.db.database import init_db; init_db(); print('OK - Database initialized')"
if %errorlevel% neq 0 (
    echo WARNING: Database initialization may have issues
)
echo.

REM Check Ollama
echo [8/8] Checking Ollama...
ollama --version
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found or not in PATH
    echo Please install Ollama from https://ollama.ai
    echo.
) else (
    echo OK - Ollama found
    echo.
    ollama list | find /i "llama3" >nul
    if %errorlevel% neq 0 (
        echo WARNING: llama3 model not pulled
        echo Run: ollama pull llama3
        echo.
    ) else (
        echo OK - llama3 model available
    )
)

echo.
echo ============================================================
echo   VERIFICATION COMPLETE
echo ============================================================
echo.
echo NEXT STEPS:
echo.
echo Terminal 1: Start Ollama
echo   > ollama serve
echo.
echo Terminal 2: Start Backend (while Terminal 1 is running)
echo   > cd backend
echo   > uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Look for message: "✅ Ollama is reachable at http://localhost:11434"
echo.
echo Terminal 3 (optional): Test backend
echo   > curl http://localhost:8000/health
echo.
pause
