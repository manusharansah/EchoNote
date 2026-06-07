# 🔧 TROUBLESHOOTING: "localhost refused to connect"

## 🎯 Problem
Frontend shows: **"localhost refused to connect"** or **"Can't reach the server"**

This means the dev server on port 5173 is NOT running.

---

## 🔍 DIAGNOSIS

### Step 1: Check if Frontend Process is Running

**Open Command Prompt and run:**

```bash
netstat -ano | findstr :5173
```

**If you see output like:**
```
TCP    127.0.0.1:5173    0.0.0.0:0    LISTENING    12345
```
→ Port 5173 IS in use (good sign, but something's wrong)

**If you see NO output:**
→ Port 5173 is free (dev server never started)

---

## 🛠️ SOLUTIONS

### Solution 1: Port 5173 Already In Use

If netstat shows port 5173 is in use by another process:

```bash
# Find what's using port 5173:
netstat -ano | findstr :5173

# You'll see something like:
# TCP    127.0.0.1:5173    0.0.0.0:0    LISTENING    12345
#                                                    ^^^^^ PID

# Kill that process (replace 12345 with actual PID):
taskkill /PID 12345 /F

# Then try again:
cd frontend\lovable
npm run dev
```

---

### Solution 2: Frontend Didn't Start - npm install Issue

**Check if npm install completed:**

```bash
cd frontend\lovable
dir node_modules
```

**If node_modules folder is EMPTY or MISSING:**
```bash
# Delete everything and reinstall:
rmdir node_modules /s /q
del package-lock.json
npm install --verbose

# Then start:
npm run dev
```

**If still fails:**
```bash
# Try with longer timeout:
npm install --timeout 120000

# Then start:
npm run dev
```

---

### Solution 3: npm dev Server Crashed

Check the terminal where you ran `npm run dev`. You should see:

```
VITE v7.x.x ready in XXX ms
➜  Local: http://localhost:5173/
```

**If you see errors instead:**

Look for lines with:
- ❌ ERROR
- ⚠️ Warning
- `Failed to`
- `Cannot find`

**Fix based on error:**
- If it says "port already in use" → Use Solution 1
- If it says "module not found" → Use Solution 2
- If it says something else → Show me the error

---

### Solution 4: Try Different Port

If port 5173 keeps causing issues:

```bash
cd frontend\lovable
npm run dev -- --port 5174
```

Then open: **http://localhost:5174** instead of 5173

---

## ✅ CORRECT STARTUP PROCESS

### Step 1: Navigate to Frontend
```bash
cd "c:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\frontend\lovable"
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```
**Wait for it to complete** - You should see:
```
added XXX packages
```

### Step 3: Start Dev Server
```bash
npm run dev
```

**You should see:**
```
VITE v7.x.x ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 4: Open Browser
```
http://localhost:5173
```

---

## 🎯 QUICK FIX (Try This First)

### Option A: One Command (Easiest)
```bash
cd frontend\lovable && taskkill /F /IM node.exe 2>nul & npm run dev
```

This:
1. Kills any Node processes
2. Starts fresh
3. Runs dev server

Then open: **http://localhost:5173**

### Option B: Manual Steps
```bash
# Step 1: Go to frontend
cd frontend\lovable

# Step 2: Kill any running Node
taskkill /F /IM node.exe

# Step 3: Clear node_modules and reinstall
rmdir node_modules /s /q
npm install

# Step 4: Start fresh
npm run dev
```

---

## 📊 DEBUGGING OUTPUT

When you run `npm run dev`, copy the FULL output and look for:

### ✅ Good Output (Should See)
```
VITE v7.3.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### ❌ Bad Output (Problem)
```
Error: Port 5173 is already in use
Error: Cannot find module
Error: ENOENT
Error: Failed to
```

---

## 🔧 ADVANCED DEBUGGING

### Check Node Installation
```bash
node --version
npm --version
```

Both should return version numbers.

If not:
- Install Node.js from: https://nodejs.org/
- Restart Command Prompt
- Try again

### Check Package.json
```bash
cd frontend\lovable
cat package.json | findstr "dev"
```

Should show:
```
"dev": "vite dev"
```

### Check Vite Config
```bash
cd frontend\lovable
cat vite.config.ts | findstr "5173"
```

Should show port 5173 configured.

---

## 💡 MOST COMMON FIX

**99% of the time, this fixes it:**

```bash
cd frontend\lovable
taskkill /F /IM node.exe 2>nul
rmdir node_modules /s /q
npm install
npm run dev
```

Then wait for:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

Then open: **http://localhost:5173**

---

## 🚨 IF STILL NOT WORKING

**Do this:**

### Step 1: Get Error Details
```bash
cd frontend\lovable
npm run dev 2>&1
```

### Step 2: Copy Full Output
Copy everything that appears in the terminal.

### Step 3: Check Backend Still Running
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Step 4: Try Different Port
```bash
cd frontend\lovable
npm run dev -- --port 5174
# Then open: http://localhost:5174
```

---

## 📞 QUICK REFERENCE

| Issue | Command |
|-------|---------|
| Port 5173 in use | `taskkill /PID <PID> /F` |
| npm modules missing | `npm install` |
| npm failed | `npm install --timeout 120000` |
| Try different port | `npm run dev -- --port 5174` |
| Kill all Node | `taskkill /F /IM node.exe` |
| Fresh install | `rmdir node_modules /s /q && npm install` |

---

## ✅ WHAT SHOULD HAPPEN

```
You run:    npm run dev
        ↓
Terminal shows:
        VITE ready in XXX ms
        Local: http://localhost:5173/
        ↓
You open browser:
        http://localhost:5173
        ↓
React app loads! ✅
```

---

## 🎯 DO THIS NOW

**Try this command exactly:**

```bash
cd "c:\Users\asus\OneDrive\Documents\NCIT HACKATHON\national-ai-hackathon-2026-team-zapped\frontend\lovable" && npm run dev
```

**Then tell me:**
1. Did you see "VITE ready" message?
2. Did it show "Local: http://localhost:5173"?
3. What error did you get (if any)?

---

**Let me know what the terminal output says and I'll help you fix it!**
