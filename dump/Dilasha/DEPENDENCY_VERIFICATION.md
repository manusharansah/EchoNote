# 📋 Dependency Verification & Project Setup

## ✅ Pre-Deployment Checklist

Follow this guide to verify all dependencies and run the project.

---

## Step 1: Verify Python & pip

### Open Command Prompt and run:
```bash
python --version
```

**Expected Output:**
```
Python 3.9.x or higher (3.10, 3.11, 3.12 also work)
```

### Check pip:
```bash
pip --version
```

**Expected Output:**
```
pip XX.X from C:\... (python X.X)
```

✅ **If both show version numbers, move to Step 2**

---

## Step 2: Navigate to Backend Directory

```bash
cd backend
```

If you get an error, you might be in the wrong directory. Should be:
```
C:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\backend
```

---

## Step 3: Create .env File

### Check if .env exists:
```bash
dir .env
```

### If it doesn't exist, copy from template:
```bash
copy .env.example .env
```

**Expected:** `.env file created successfully`

---

## Step 4: Install Dependencies

### Run:
```bash
pip install -r requirements.txt
```

**This will:**
- Download and install all required Python packages
- Install FastAPI, Whisper, Torch, etc.
- May take 5-15 minutes (first time)
- Will show progress as it installs

**Expected Output (at end):**
```
Successfully installed fastapi uvicorn sqlalchemy httpx reportlab openai-whisper torch ...
```

### Troubleshooting Installation:

**Issue**: `pip: command not found`
```bash
# Try explicit path
python -m pip install -r requirements.txt
```

**Issue**: Permission denied
```bash
# Run as administrator or use --user
pip install --user -r requirements.txt
```

**Issue**: Torch installation slow
- ⚠️ This is normal - torch is large (2+ GB)
- Be patient, it can take 10+ minutes
- Don't interrupt the process

---

## Step 5: Verify Installed Packages

### Check key packages:
```bash
pip list | grep -E "fastapi|uvicorn|sqlalchemy|httpx|reportlab"
```

Or on Windows:
```bash
pip list | findstr "fastapi uvicorn sqlalchemy httpx reportlab"
```

**Expected:** All packages listed with versions

### Quick individual checks:
```bash
python -c "import fastapi; print('✅ FastAPI OK')"
python -c "import whisper; print('✅ Whisper OK')"
python -c "import sqlalchemy; print('✅ SQLAlchemy OK')"
python -c "import reportlab; print('✅ ReportLab OK')"
```

✅ **If all show OK, move to Step 6**

---

## Step 6: Verify Ollama Installation

### Check if Ollama is installed:
```bash
ollama --version
```

**Expected Output:**
```
ollama version X.X.X
```

### If not installed:
1. Download from https://ollama.ai
2. Install for your OS (Windows/Mac/Linux)
3. Run the installer
4. Restart your terminal
5. Verify with `ollama --version`

### Check if model is pulled:
```bash
ollama list
```

**Expected Output:**
```
NAME                    ID              SIZE    MODIFIED
llama3:latest           xxxxxxxxxxxxx   4.7GB   XX hours ago
```

### If model not available:
```bash
ollama pull llama3
```

**This will:**
- Download the llama3 model (~4.7 GB)
- Takes 2-10 minutes depending on internet
- Don't interrupt the download

---

## Step 7: Initialize Database

### Create the database (run from backend directory):
```bash
python -c "from app.db.database import init_db; init_db(); print('✅ Database initialized')"
```

**Expected Output:**
```
✅ Database initialized
```

This creates:
- `meeting_minutes.db` - SQLite database
- Tables for users, meetings, etc.

---

## Step 8: Start Ollama Service

### In Terminal 1, run:
```bash
ollama serve
```

**Expected Output:**
```
Listening on 127.0.0.1:11434
```

⚠️ **IMPORTANT: Keep this terminal open**
- Don't close it while testing
- Ollama needs to stay running in background
- If it closes, backend will fail

---

## Step 9: Start Backend Server

### In Terminal 2 (while Terminal 1 runs Ollama), run:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### If you see this, everything is working! ✅

---

## ⚠️ Common Issues & Solutions

### Issue: "Python command not found"
**Solution:**
- Python not installed OR not in PATH
- Install Python from python.org
- During installation, check "Add Python to PATH"

### Issue: "pip: command not found"
**Solution:**
```bash
python -m pip install -r requirements.txt
```

### Issue: "Permission denied" during pip install
**Solution:**
```bash
# Option 1: Use --user flag
pip install --user -r requirements.txt

# Option 2: Run as Administrator
# Right-click Command Prompt → Run as Administrator
```

### Issue: Torch installation fails or times out
**Solution:**
```bash
# Install CPU-only version (smaller, faster)
pip install torch==2.4.1 --index-url https://download.pytorch.org/whl/cpu

# Then retry full install
pip install -r requirements.txt
```

### Issue: "Cannot connect to Ollama"
**Solution:**
- Is Terminal 1 still running `ollama serve`?
- Check: `curl http://localhost:11434/api/tags`
- If fails: Ollama not running or not installed

### Issue: "Model 'llama3' not found"
**Solution:**
```bash
ollama pull llama3
# Wait for download to complete
```

### Issue: Backend won't start - Port 8000 already in use
**Solution:**
```bash
# Option 1: Kill existing process
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it

# Option 2: Use different port
uvicorn app.main:app --port 8001
```

### Issue: Database error on startup
**Solution:**
```bash
# Delete old database and recreate
del meeting_minutes.db
python -c "from app.db.database import init_db; init_db()"
```

---

## ✅ Full Verification Checklist

Before declaring "ready", verify:

- [ ] Python 3.9+ installed
- [ ] pip works (`pip --version`)
- [ ] .env file exists (`dir .env`)
- [ ] All dependencies installed (`pip list | grep fastapi`)
- [ ] Ollama installed (`ollama --version`)
- [ ] Model pulled (`ollama list | grep llama3`)
- [ ] Database initialized (no errors when running init_db)
- [ ] Ollama running in Terminal 1 (see "Listening on...")
- [ ] Backend starts in Terminal 2 (see "✅ Ollama is reachable...")
- [ ] Backend shows "Application startup complete"

---

## 🚀 Project is Ready When:

### Terminal 1 (Ollama) shows:
```
Listening on 127.0.0.1:11434
```

### Terminal 2 (Backend) shows:
```
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## 📝 Quick Reference - Complete Commands

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Navigate and install
cd backend
pip install -r requirements.txt

# Initialize database
python -c "from app.db.database import init_db; init_db()"

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Verify backend is running (Terminal 3)
curl http://localhost:8000/health
```

---

## 🎯 What Each Component Does

| Component | Purpose | Status |
|-----------|---------|--------|
| Python 3.9+ | Backend runtime | Required |
| pip | Package manager | Required |
| requirements.txt | Dependency list | Required |
| Ollama | Local LLM service | Required |
| llama3 model | AI model for summarization | Required |
| SQLite | Database | Created automatically |
| FastAPI | Web framework | Installed via pip |
| Uvicorn | ASGI server | Installed via pip |

---

## 📊 Installation Time Estimates

| Step | Time |
|------|------|
| Python verification | 1 min |
| Dependencies installation | 10-15 min (first time) |
| Ollama installation | 5-10 min (one-time) |
| Model download | 5-10 min (one-time) |
| Database initialization | 1 min |
| Backend startup | 5 seconds |
| **Total (first time)** | **25-45 min** |
| **Total (subsequent)** | **2-3 min** |

---

## ✨ Next Steps After Verification

1. ✅ Backend running on `http://localhost:8000`
2. ⏭️ Start frontend (`npm run dev` in `frontend/lovable`)
3. ⏭️ Open `http://localhost:5173` in browser
4. ⏭️ Upload test audio
5. ⏭️ Watch pipeline progress

---

## 🆘 Still Having Issues?

1. **Check backend logs** - They show exact errors
2. **Read** `backend/MINUTES_GENERATION_TROUBLESHOOTING.md` - 50+ solutions
3. **Verify Ollama** - Run `ollama list` and `curl http://localhost:11434/api/tags`
4. **Check ports** - Make sure 8000 and 11434 are free

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Terminal 1 shows: `Listening on 127.0.0.1:11434`  
✅ Terminal 2 shows: `✅ Ollama is reachable...`  
✅ Terminal 2 shows: `Application startup complete`  
✅ Can access `http://localhost:8000/health` in browser  
✅ Backend logs show clean startup (no errors)  

---

**Ready to proceed?** Move to the next step once all verifications pass! 🚀
