# ✅ FULL STACK VERIFICATION GUIDE

## 🎯 OBJECTIVE: Verify Backend ✅ and Start Frontend ⏳

---

## 1️⃣ VERIFY BACKEND IS RUNNING

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```
**Expected:** `{"status":"ok"}`

### Test 2: Browser Test
```
Open: http://localhost:8000/health
Expected: {"status":"ok"}
```

### Test 3: API Documentation
```
Open: http://localhost:8000/docs
Expected: Swagger UI loads with all endpoints
```

### Test 4: Check Ollama Connection
```bash
curl http://localhost:8000/api/health
# or just check the backend logs, should show:
# ✅ Ollama is reachable at http://localhost:11434
```

**✅ If all above work, backend is verified!**

---

## 2️⃣ START FRONTEND

### Choose Option A (Easiest):
```bash
cd frontend\lovable
START_FRONTEND.bat
```

### Or Option B (Manual):
```bash
cd frontend\lovable
npm install
npm run dev
```

### Or Option C (Different Port):
```bash
cd frontend\lovable
npm install
npm run dev -- --port 5174
```

---

## 3️⃣ VERIFY FRONTEND IS RUNNING

### Test 1: Browser Access
```
Open: http://localhost:5173
Expected: React app loads
```

### Test 2: Check Console
- Open browser DevTools (F12)
- Go to Console tab
- Should not show errors
- Should show network requests to backend

### Test 3: Frontend→Backend Communication
- In DevTools, go to Network tab
- Do any action in app
- Should see requests to `http://localhost:8000/`
- Status codes should be 200, 201, etc.

**✅ If frontend loads and shows no red errors, frontend is working!**

---

## 🎬 FULL SYSTEM VERIFICATION

### All 3 Services Running
```
Terminal 1: ollama serve
   Status: ✅ Listening on 127.0.0.1:11434

Terminal 2: Backend (setup_and_run.bat)
   Status: ✅ Uvicorn running on http://0.0.0.0:8000
   
Terminal 3: Frontend (npm run dev)
   Status: ✅ VITE ready on http://localhost:5173
```

### Quick Test Sequence

1. **Open 3 new terminals** (or use tmux/screen)

2. **Terminal A - Ollama**
   ```bash
   ollama serve
   # Should show: Listening on 127.0.0.1:11434
   ```

3. **Terminal B - Check Backend**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

4. **Terminal C - Start Frontend**
   ```bash
   cd frontend\lovable
   npm install
   npm run dev
   # Should show: http://localhost:5173
   ```

5. **Browser - Test Everything**
   ```
   Open: http://localhost:5173
   Should load the React app
   ```

---

## 📊 VERIFICATION MATRIX

| Service | URL | Command | Expected |
|---------|-----|---------|----------|
| **Ollama** | :11434 | `ollama serve` | "Listening..." |
| **Backend** | :8000 | See logs | "Application startup complete" |
| **Backend Health** | /health | `curl localhost:8000/health` | `{"status":"ok"}` |
| **Backend Docs** | /docs | Browser: localhost:8000/docs | Swagger UI |
| **Frontend** | :5173 | `npm run dev` | "ready in XXX ms" |
| **Frontend App** | localhost:5173 | Browser | React app loads |

---

## ✨ EXPECTED OUTPUTS

### Backend Terminal (Should Show)
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Frontend Terminal (Should Show)
```
  VITE v7.3.1  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Browser (Frontend at localhost:5173)
```
Meeting Minutes AI Logo
Sign In / Sign Up buttons
Record button (once authenticated)
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] Backend responds to health check
- [ ] Backend shows "Application startup complete"
- [ ] Ollama connection shows "✅"
- [ ] Frontend starts on port 5173
- [ ] Frontend loads React app
- [ ] No red errors in browser console
- [ ] Network requests going to backend
- [ ] Can sign in/up (test)
- [ ] Record button appears (after auth)

**All checked? You're good to go! 🎉**

---

## 🚀 NEXT STEPS AFTER VERIFICATION

### Test Full Workflow

1. **Sign Up**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Create account with email/password

2. **Record Audio**
   - Click "Record" button
   - Record some audio (or upload test file)
   - Wait for upload to complete

3. **Generate Minutes**
   - Click "Generate Minutes"
   - Watch backend process
   - PDF should be generated

4. **Download & Verify**
   - Download generated PDF
   - Check content is correct

---

## ⚠️ COMMON ISSUES & FIXES

| Issue | Solution |
|-------|----------|
| **Backend not responding** | Check if still running, see backend logs |
| **"Cannot find npm"** | Install Node.js from nodejs.org |
| **Port 5173 in use** | Kill process or use `npm run dev -- --port 5174` |
| **Frontend shows errors** | Check browser console, check backend logs |
| **No network requests** | Check CORS in backend/.env, check localhost:8000/docs |
| **Can't authenticate** | Check backend auth endpoint, check database |

---

## 📞 QUICK COMMANDS

```bash
# Check backend health
curl http://localhost:8000/health

# Check Ollama running
curl http://localhost:11434/api/tags

# Start frontend
cd frontend\lovable && npm run dev

# Kill process on port
netstat -ano | findstr :PORT
taskkill /PID PID_NUMBER /F

# Install Node.js
# https://nodejs.org/
```

---

## 🎊 COMPLETE SYSTEM

When everything is running:

```
http://localhost:5173  ← Frontend (React App)
        ↓
http://localhost:8000  ← Backend (FastAPI)
        ↓
http://localhost:11434 ← Ollama (LLM Service)
        ↓
(local files)          ← Database, Storage
```

---

## ✅ FINAL VERIFICATION

### Do This Now

**Terminal 1:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

**Terminal 2:**
```bash
cd frontend\lovable
npm run dev
# Should show: http://localhost:5173
```

**Browser:**
```
Open: http://localhost:5173
# Should load React app
```

---

## 🎉 YOU'RE DONE!

Your complete Meeting Minutes AI stack is:
- ✅ Backend: Running
- ✅ Ollama: Running
- ✅ Frontend: Started
- ✅ System: Verified

**Now start using the app! 🚀**

---

**Next: Open http://localhost:5173 and test the workflow!**
