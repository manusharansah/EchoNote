# 🚀 Complete Setup & Run Guide

> **Status**: All dependencies ready to install  
> **Time**: 30-45 minutes (first time)  
> **Difficulty**: Easy - Follow step by step

---

## 📋 System Requirements

Before starting, ensure you have:

- ✅ **Python 3.9 or higher** (3.10, 3.11, 3.12 OK)
- ✅ **pip** (comes with Python)
- ✅ **Ollama** installed (from https://ollama.ai)
- ✅ **At least 8GB RAM** (for Ollama)
- ✅ **5GB free disk space** (for dependencies and model)
- ✅ **Ports 8000 & 11434** available (not in use)

---

## ⚡ Quick Start (Copy-Paste)

If you're experienced, just copy-paste these commands:

### Terminal 1: Start Ollama
```bash
ollama serve
```

### Terminal 2: Install & Start Backend
```bash
cd backend
pip install -r requirements.txt
python -c "from app.db.database import init_db; init_db()"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Done!** See "Expected Output" section below.

---

## 📖 Step-by-Step Guide

### Step 1: Verify Python Installation

**Open Command Prompt** (Windows) or Terminal (Mac/Linux)

**Check Python version:**
```bash
python --version
```

**Expected Output:**
```
Python 3.9.x   (or 3.10.x, 3.11.x, 3.12.x)
```

**If not installed:**
- Download from https://python.org
- During installation, **CHECK** "Add Python to PATH"
- Restart Command Prompt after installation

---

### Step 2: Verify pip

**In same Command Prompt:**
```bash
pip --version
```

**Expected Output:**
```
pip 23.x from C:\...\ (python 3.x)
```

**If not working:**
```bash
python -m pip --version
```

✅ **Both Python and pip confirmed - Move to Step 3**

---

### Step 3: Navigate to Backend Directory

**In Command Prompt:**
```bash
cd backend
```

Full path should be:
```
C:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\backend
```

**Verify:**
```bash
dir requirements.txt
```

Should show: `requirements.txt` file

✅ **You're in the right directory - Move to Step 4**

---

### Step 4: Create Configuration File

**Check if .env exists:**
```bash
dir .env
```

**If NOT found, create it:**
```bash
copy .env.example .env
```

**Expected Output:**
```
1 file(s) copied.
```

✅ **Configuration ready - Move to Step 5**

---

### Step 5: Install Python Dependencies

**This is the longest step (10-15 minutes first time)**

```bash
pip install -r requirements.txt
```

**What it's doing:**
- Downloading FastAPI, Uvicorn, SQLAlchemy
- Installing Whisper and Torch (large files)
- Setting up all dependencies

**Expected Output (at end):**
```
Successfully installed fastapi-0.115.0 uvicorn-0.30.6 sqlalchemy-2.0.35 ...
```

⚠️ **Common Issues:**

**Issue**: Torch installation slow or fails
```bash
# Use CPU-only Torch (smaller, faster)
pip install torch==2.4.1 --index-url https://download.pytorch.org/whl/cpu
# Then retry
pip install -r requirements.txt
```

**Issue**: Permission denied
```bash
# Use user flag
pip install --user -r requirements.txt
```

✅ **All dependencies installed - Move to Step 6**

---

### Step 6: Verify Installed Packages

**Test individual packages:**
```bash
python -c "import fastapi; print('✅ FastAPI OK')"
python -c "import uvicorn; print('✅ Uvicorn OK')"
python -c "import sqlalchemy; print('✅ SQLAlchemy OK')"
python -c "import httpx; print('✅ httpx OK')"
python -c "import reportlab; print('✅ ReportLab OK')"
```

**Expected Output:** All show ✅ OK

```bash
python -c "import whisper; print('✅ Whisper OK')"
```

**Note:** This might take a moment (downloading model on first run)

✅ **All packages verified - Move to Step 7**

---

### Step 7: Verify Ollama Installation

**In Command Prompt:**
```bash
ollama --version
```

**Expected Output:**
```
ollama version 0.x.x
```

**If not found:**
- Download from https://ollama.ai
- Install for your OS
- Restart Command Prompt
- Try again

**Check available models:**
```bash
ollama list
```

**Expected Output:**
```
NAME                ID              SIZE    MODIFIED
llama3:latest       xxxxx...        4.7GB   XX hours ago
```

**If llama3 not listed:**
```bash
ollama pull llama3
```

This downloads the model (~4.7 GB) - takes 5-10 minutes

✅ **Ollama verified - Move to Step 8**

---

### Step 8: Initialize Database

**Still in backend directory:**
```bash
python -c "from app.db.database import init_db; init_db(); print('✅ Database initialized')"
```

**Expected Output:**
```
✅ Database initialized
```

**Verify database created:**
```bash
dir meeting_minutes.db
```

Should show the database file

✅ **Database ready - Move to Step 9**

---

### Step 9: Start Ollama Service

**IMPORTANT:** Open a **NEW Command Prompt window** (keep this one open)

**In the NEW window:**
```bash
ollama serve
```

**Expected Output:**
```
Listening on 127.0.0.1:11434
```

**Keep this window open!** Don't close it.

---

### Step 10: Start Backend Server

**In the ORIGINAL Command Prompt window** (in backend directory):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

✅ **Backend is running!**

---

## ✅ Verify Everything Works

**Open a THIRD Command Prompt window** and run:

```bash
curl http://localhost:8000/health
```

**Expected Output:**
```json
{"status":"ok"}
```

Or open `http://localhost:8000/health` in browser and see:
```json
{"status":"ok"}
```

✅ **Backend is responding!**

---

## 🎯 What You Should Have Now

### Terminal 1 (Ollama)
```
Listening on 127.0.0.1:11434
```
✅ Keep this running

### Terminal 2 (Backend)
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
Uvicorn running on http://0.0.0.0:8000
Application startup complete
```
✅ Keep this running

### Browser (Optional Test)
```
http://localhost:8000/health
{"status":"ok"}
```
✅ Backend responding

---

## 🚀 Next Steps

### Option 1: Test with Frontend
```bash
cd frontend/lovable
npm install
npm run dev
```

Then open `http://localhost:5173` in browser

### Option 2: Test API Directly
```bash
# Test health
curl http://localhost:8000/health

# Create user (from API docs)
curl -X POST http://localhost:8000/docs
```

### Option 3: Upload Test Audio
Use the frontend to record and upload audio, then watch the pipeline!

---

## ⚠️ Troubleshooting

### "Connection refused on 8000"
```bash
# Check if port in use
netstat -ano | findstr :8000

# If shows process, kill it or use different port
uvicorn app.main:app --port 8001
```

### "Cannot connect to Ollama"
1. Check Terminal 1 still running `ollama serve`
2. If closed, start it again
3. Or test: `curl http://localhost:11434/api/tags`

### "Module not found" errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### "Database error"
```bash
# Delete and recreate database
del meeting_minutes.db
python -c "from app.db.database import init_db; init_db()"
```

### "Torch installation fails"
```bash
# Use CPU-only version
pip install torch==2.4.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

---

## 📊 Time Breakdown

| Step | Time |
|------|------|
| Python verification | 1 min |
| pip verification | 1 min |
| Directory setup | 1 min |
| .env creation | 1 min |
| Dependencies install | 10-15 min |
| Package verification | 2 min |
| Ollama verification | 1 min |
| Model download (if needed) | 5-10 min |
| Database initialization | 1 min |
| Start Ollama | 1 min |
| Start Backend | 1 min |
| **Total First Time** | **25-40 min** |
| **Subsequent Times** | **2-3 min** |

---

## ✨ Success Indicators

You'll know everything works when:

✅ Ollama Terminal shows: `Listening on 127.0.0.1:11434`

✅ Backend Terminal shows:
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
Uvicorn running on http://0.0.0.0:8000
Application startup complete
```

✅ Browser shows `http://localhost:8000/health` returns `{"status":"ok"}`

✅ No error messages in either terminal

✅ Both terminals still running (don't close them)

---

## 🎉 Deployment Complete!

Your Meeting Minutes AI backend is now:
- ✅ Configured
- ✅ Ready to accept audio uploads
- ✅ Connected to Ollama for AI processing
- ✅ Ready to generate minutes

**Next:** Open frontend at `http://localhost:5173` (or see "Next Steps" above)

---

## 📞 Need Help?

**Can't get past a step?**
1. Check the troubleshooting section above
2. Read `DEPENDENCY_VERIFICATION.md` for detailed checks
3. Read `backend/MINUTES_GENERATION_TROUBLESHOOTING.md` for 50+ solutions
4. Check backend logs - they show exact errors

**Everything working?**
➡️ Proceed to frontend setup or test with API!

---

**Last Updated**: June 2026  
**Status**: Ready for Production
