# 🚀 READY TO RUN - FINAL INSTRUCTIONS

## ✅ Everything is Prepared

I've created your configuration and setup scripts. Here's how to run the project:

---

## 🎯 OPTION 1: Automated Setup (EASIEST - Windows)

### Just Run One Script!

1. **Open Command Prompt**
   - Press: `Win + R`
   - Type: `cmd`
   - Press: Enter

2. **Navigate to backend**
   ```bash
   cd "c:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\backend"
   ```

3. **Run the setup script**
   ```bash
   setup_and_run.bat
   ```

**That's it!** The script will:
- ✅ Check Python
- ✅ Check pip
- ✅ Install all dependencies
- ✅ Initialize database
- ✅ Start the backend
- ✅ Tell you what to do next

---

## 🎯 OPTION 2: Python Setup Script

### If .bat doesn't work, use Python:

```bash
cd "c:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\backend"
python setup_and_run.py
```

This does the same thing as the .bat script.

---

## 🎯 OPTION 3: Manual Commands (Step-by-Step)

If you prefer to run commands manually:

### Terminal 1: Start Ollama
```bash
ollama serve
```

**Expected Output:**
```
Listening on 127.0.0.1:11434
```

**Keep this running!**

---

### Terminal 2: Install & Run Backend

```bash
# Navigate to backend
cd "c:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\backend"

# Install dependencies (first time only)
pip install -r requirements.txt

# Initialize database (first time only)
python -c "from app.db.database import init_db; init_db(); print('Database ready')"

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## ✅ Verify Everything Works

### Test 1: Browser Test

Open: `http://localhost:8000/health`

Should see:
```json
{"status":"ok"}
```

### Test 2: From Command Line

In a new terminal:
```bash
curl http://localhost:8000/health
```

Should show:
```json
{"status":"ok"}
```

---

## 📋 Pre-Requisites (Must Have!)

Before running, ensure:

- [ ] **Python 3.9+** installed
  ```bash
  python --version
  ```

- [ ] **pip** working
  ```bash
  pip --version
  ```

- [ ] **Ollama** installed from https://ollama.ai
  ```bash
  ollama --version
  ```

- [ ] **llama3 model** pulled
  ```bash
  ollama list
  ```
  
  If not there:
  ```bash
  ollama pull llama3
  ```

- [ ] **Ports 8000 & 11434** are free
- [ ] **At least 8GB RAM** available
- [ ] **5GB free disk** space

---

## 📊 What Each File Does

| File | Purpose |
|------|---------|
| `.env` | Configuration (created automatically) |
| `setup_and_run.bat` | Automated setup & run (Windows) |
| `setup_and_run.py` | Automated setup & run (Python) |
| `requirements.txt` | All dependencies |

---

## ⚠️ If Something Goes Wrong

### "Python not found"
```bash
# Install Python from https://python.org
# Make sure to check "Add Python to PATH"
```

### "pip not found"
```bash
# Try:
python -m pip install -r requirements.txt
```

### "Cannot connect to Ollama"
- Is Terminal 1 still running `ollama serve`?
- If not, start it in a new terminal

### "Permission denied"
```bash
# Try with --user flag:
pip install --user -r requirements.txt
```

### "Torch installation times out"
```bash
# Install CPU-only torch (smaller):
pip install torch==2.4.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

---

## 🎯 First Run vs Subsequent Runs

### FIRST RUN (30-45 minutes)
- Installs dependencies (~15 min)
- Downloads Whisper model (~10 min)
- Starts backend (~5 min)

### SUBSEQUENT RUNS (2-3 minutes)
- Just starts services (everything already installed)

---

## 📚 Key Files Ready

✅ `.env` - Configuration file (created)
✅ `setup_and_run.bat` - Automated setup (Windows)
✅ `setup_and_run.py` - Automated setup (Python)
✅ `requirements.txt` - All dependencies
✅ `app/main.py` - Backend application
✅ `app/db/database.py` - Database setup

---

## 🚀 Quick Decision Tree

```
Do you have time to wait 30-45 min?
├─ YES → Run: setup_and_run.bat (or setup_and_run.py)
│
Do you prefer step-by-step?
├─ YES → Follow Option 3 above (manual commands)
│
Everything installed already?
├─ YES → Just run:
│        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✨ Success Indicators

You'll know everything is working when:

### Terminal Running Ollama
```
Listening on 127.0.0.1:11434
```

### Terminal Running Backend
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Browser Test
```
http://localhost:8000/health
{"status":"ok"}
```

---

## 🎉 What's Next After It's Running?

1. ✅ Backend is running on `http://localhost:8000`
2. ⏭️ Start frontend: `cd frontend/lovable && npm run dev`
3. ⏭️ Open: `http://localhost:5173`
4. ⏭️ Upload test audio
5. ⏭️ Watch pipeline generate minutes!

---

## 📞 Quick Reference

| Command | What It Does |
|---------|--------------|
| `setup_and_run.bat` | Automated setup & run |
| `python setup_and_run.py` | Python version of setup |
| `pip install -r requirements.txt` | Install dependencies |
| `python -c "from app.db.database import init_db; init_db()"` | Initialize database |
| `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | Start backend |
| `ollama serve` | Start Ollama service |
| `ollama pull llama3` | Download llama3 model |
| `ollama list` | List available models |

---

## ✅ Files I Created For You

1. ✅ `.env` - Configuration file
2. ✅ `setup_and_run.bat` - Windows automated setup
3. ✅ `setup_and_run.py` - Python automated setup
4. ✅ This file - Instructions

Everything else (code, requirements, etc.) was already there!

---

## 🎯 FINAL ACTION

### Choose one:

**Option 1 (Easiest):**
```bash
cd backend
setup_and_run.bat
```

**Option 2 (Alternative):**
```bash
cd backend
python setup_and_run.py
```

**Option 3 (Manual):**
Follow the manual commands in "OPTION 3" above.

---

## 📝 That's It!

You now have:
- ✅ Configuration file (.env)
- ✅ Automated setup scripts
- ✅ Complete instructions
- ✅ Everything ready to run

**Pick your option above and run it!** 🚀

---

**Good luck! Your project is ready! 🎉**
