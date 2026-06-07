#!/usr/bin/env python3
"""
Meeting Minutes AI - Automated Setup & Verification Script
Runs all setup tasks and verifies everything is ready
"""

import sys
import subprocess
import os
from pathlib import Path

# Colors for terminal output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BLUE}{BOLD}{'='*60}{RESET}")
    print(f"{BLUE}{BOLD}{text:^60}{RESET}")
    print(f"{BLUE}{BOLD}{'='*60}{RESET}\n")

def print_step(step_num, text):
    print(f"{BOLD}[STEP {step_num}]{RESET} {text}")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def run_command(cmd, description=""):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print_header("MEETING MINUTES AI - SETUP & VERIFICATION")
    
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Step 1: Check Python
    print_step(1, "Checking Python installation...")
    success, stdout, stderr = run_command("python --version")
    if success:
        print_success(f"Python found: {stdout.strip()}")
    else:
        print_error("Python not found. Please install Python 3.9+")
        return False
    
    # Step 2: Check pip
    print_step(2, "Checking pip...")
    success, stdout, stderr = run_command("pip --version")
    if success:
        print_success(f"pip found: {stdout.strip()}")
    else:
        print_error("pip not found")
        return False
    
    # Step 3: Check if .env exists
    print_step(3, "Checking configuration...")
    env_file = backend_dir / ".env"
    if env_file.exists():
        print_success(".env file exists")
    else:
        print_error(".env file not found")
        print("Creating .env from .env.example...")
        env_example = backend_dir / ".env.example"
        if env_example.exists():
            env_file.write_text(env_example.read_text())
            print_success(".env created")
        else:
            print_error("Could not create .env")
            return False
    
    # Step 4: Install dependencies
    print_step(4, "Installing Python dependencies...")
    print("(This may take 10-15 minutes on first run)")
    success, stdout, stderr = run_command("pip install -r requirements.txt")
    if success:
        print_success("Dependencies installed successfully")
    else:
        print_error(f"Failed to install dependencies")
        print(f"Error: {stderr[:200]}")
        print("\nTrying with --user flag...")
        success, stdout, stderr = run_command("pip install --user -r requirements.txt")
        if not success:
            print_error("Installation still failed")
            return False
        print_success("Dependencies installed with --user flag")
    
    # Step 5: Verify key packages
    print_step(5, "Verifying installed packages...")
    packages = ["fastapi", "uvicorn", "sqlalchemy", "httpx", "reportlab"]
    all_ok = True
    for pkg in packages:
        success, _, _ = run_command(f"python -c \"import {pkg}; print('OK')\"")
        if success:
            print_success(f"{pkg}")
        else:
            print_error(f"{pkg}")
            all_ok = False
    
    if not all_ok:
        print_warning("Some packages missing, but continuing...")
    
    # Step 6: Initialize database
    print_step(6, "Initializing database...")
    try:
        from app.db.database import init_db
        init_db()
        print_success("Database initialized")
    except Exception as e:
        print_error(f"Database initialization failed: {str(e)[:100]}")
        print_warning("Continuing anyway...")
    
    # Step 7: Check Ollama
    print_step(7, "Checking Ollama installation...")
    success, stdout, stderr = run_command("ollama --version")
    if success:
        print_success(f"Ollama found: {stdout.strip()}")
    else:
        print_warning("Ollama not found or not in PATH")
        print(f"Please install from https://ollama.ai")
        print(f"And make sure to run 'ollama serve' before starting the backend")
    
    # Success!
    print_header("✅ SETUP COMPLETE")
    
    print(f"\n{GREEN}{BOLD}Next steps:{RESET}\n")
    print("1. Open a NEW command prompt or PowerShell")
    print("   Run: ollama serve")
    print("   (Keep it running)")
    print()
    print("2. In the SAME window as this script, the backend will start")
    print("   Watch for: '✅ Ollama is reachable at http://localhost:11434'")
    print()
    print("3. Open browser: http://localhost:8000/health")
    print("   Should see: {\"status\":\"ok\"}")
    print()
    print(f"{YELLOW}Press Enter to start the backend server...{RESET}")
    input()
    
    # Start the backend
    print("\nStarting backend server...")
    print("(Press CTRL+C to stop)")
    print()
    
    os.system("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Setup interrupted by user{RESET}")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)
