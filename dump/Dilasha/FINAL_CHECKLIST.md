# ✅ FINAL LAUNCH CHECKLIST

## 🎯 Before You Run

### System Requirements
- [ ] Windows 10/11 or Linux/Mac
- [ ] Python 3.9 or newer installed
- [ ] At least 8GB RAM available
- [ ] 5GB free disk space
- [ ] Stable internet connection (first run downloads models)

### External Software
- [ ] Ollama installed from https://ollama.ai
- [ ] `ollama --version` returns a version number
- [ ] `ollama list` shows models (or empty if first time)

### Ports Available
- [ ] Port 8000 is free (backend)
- [ ] Port 11434 is free (Ollama)
- [ ] (Check: `netstat -an | findstr :8000`)

### Repository State
- [ ] You're in the project root directory
- [ ] You can see `backend/` folder
- [ ] You can see `frontend/` folder
- [ ] You can see `.env` file in `backend/`

---

## 🚀 Launch Sequence

### Step 1: Terminal 1 - Start Ollama
```bash
ollama serve
```

✅ **Success looks like:**
```
Listening on 127.0.0.1:11434
```

✅ **IMPORTANT: Keep this terminal running!**

---

### Step 2: Terminal 2 - Setup & Run Backend
```bash
cd backend
setup_and_run.bat
```

⏱️ **First time:** 15-30 minutes
⏱️ **After:** 2 minutes

✅ **Success looks like:**
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
Uvicorn running on http://0.0.0.0:8000
Application startup complete
```

✅ **IMPORTANT: Keep this terminal running!**

---

### Step 3: Terminal 3 - Verify Backend Running
```bash
curl http://localhost:8000/health
```

✅ **Success response:**
```json
{"status":"ok"}
```

---

## 🧪 Quick Verification Tests

### Test 1: Health Check API
```bash
# Terminal 3
curl http://localhost:8000/health
```
Expected: `{"status":"ok"}`

### Test 2: API Documentation
```
Browser: http://localhost:8000/docs
```
Expected: Swagger UI loads with API endpoints

### Test 3: Ollama Connectivity
```bash
# Terminal 3
curl http://localhost:11434/api/tags
```
Expected: JSON list of available models

---

## ⚠️ If Something Doesn't Work

### "Python not found"
```bash
# Check installation
python --version
# Install from: https://python.org (check "Add to PATH")
```

### "Ollama connection refused"
```bash
# In Terminal 1, make sure you ran:
ollama serve
# It should still be running in that terminal
```

### "pip not found"
```bash
# Try alternative:
python -m pip install -r requirements.txt
```

### "Port 8000 already in use"
```bash
# Find process using port:
netstat -ano | findstr :8000
# Kill it (replace PID):
taskkill /PID <PID> /F
```

### "Module not found" errors
```bash
# Reinstall dependencies:
pip install -r requirements.txt --force-reinstall
```

---

## 📊 Expected Timings

| Phase | Time |
|-------|------|
| Ollama start | < 5 seconds |
| Dependency check | 30 seconds |
| First dependency install | 10-15 minutes |
| Database init | 30 seconds |
| Backend startup | 1-2 minutes |
| **First Run Total** | **15-30 min** |
| **Subsequent Runs** | **2-3 min** |

---

## ✅ Success Indicators

### Terminal 1 (Ollama)
```
✅ Should show:
Listening on 127.0.0.1:11434

✅ Should stay running
```

### Terminal 2 (Backend)
```
✅ Should show:
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete

✅ Should stay running
```

### Terminal 3 (Tests)
```
✅ Should show:
{"status":"ok"}

✅ This terminal can be closed after verification
```

### Browser
```
✅ http://localhost:8000/health shows: {"status":"ok"}
✅ http://localhost:8000/docs shows: Swagger UI
```

---

## 🎯 After Backend is Running

### Start Frontend
```bash
# Terminal 4
cd frontend/lovable
npm install
npm run dev
```

### Open Application
```
Browser: http://localhost:5173
```

### Test Complete Workflow
1. Sign up with email
2. Record test audio
3. Click "Generate Minutes"
4. Download and check PDF

---

## 🎉 Everything Ready?

Check all boxes above, then run:

```bash
cd backend
setup_and_run.bat
```

---

## 📝 Files You'll Need

### In `backend/` directory:
- ✅ `.env` - Configuration
- ✅ `requirements.txt` - Dependencies
- ✅ `setup_and_run.bat` - Setup script
- ✅ `setup_and_run.py` - Alternative setup

### Documentation:
- ✅ `LAUNCH_NOW.md` - This file
- ✅ `RUN_INSTRUCTIONS.md` - Detailed guide
- ✅ `README.md` - Project info

---

## 🔄 Troubleshooting Flow

```
Issue: Can't start backend?
├─ Terminal 1 running ollama serve? → YES
│  ├─ Python installed? → Install from python.org
│  ├─ Dependencies installed? → Run: pip install -r requirements.txt
│  └─ Port 8000 free? → Kill process on port 8000
│
└─ Terminal 1 NOT running ollama serve?
   └─ Start it: ollama serve
```

---

## 🚀 Quick Command Reference

```bash
# All in one (recommended):
cd backend && setup_and_run.bat

# Or step by step:
cd backend
pip install -r requirements.txt
python -c "from app.db.database import init_db; init_db()"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal:
ollama serve

# In another terminal (test):
curl http://localhost:8000/health
```

---

## ✨ You're Ready!

Everything is prepared. Just follow the Launch Sequence above.

**Current Status:**
- ✅ Configuration: Done
- ✅ Scripts: Created
- ✅ Documentation: Complete
- ✅ Code: Fixed
- ✅ Ready to Run: **YES**

---

## 🎊 Next Command

```bash
cd backend
setup_and_run.bat
```

**That's it! Go run it! 🚀**
