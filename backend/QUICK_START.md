# Quick Start - Meeting Minutes Generation

## ⚡ 5-Minute Setup

### **Step 1: Install Ollama**
Download and install from: https://ollama.ai

### **Step 2: Copy .env configuration**
```bash
cp .env.example .env
```

The defaults are fine for local development:
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_MODEL=llama3`
- `WHISPER_MODE=local`

### **Step 3: Start Ollama (in terminal #1)**
```bash
ollama serve
```

Wait for it to say: `Listening on 127.0.0.1:11434`

### **Step 4: Install Python dependencies (in terminal #2)**
```bash
cd backend
pip install -r requirements.txt
```

On first run of Whisper, it will download ~140MB model (one-time only).

### **Step 5: Start the backend**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Should see:
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
```

### **Step 6: Test the flow**
1. Upload audio through frontend
2. Watch backend logs for progress
3. PDF appears when `DONE`

---

## ✅ Checklist

- [ ] Ollama installed and running (`ollama serve`)
- [ ] `.env` file copied from `.env.example`
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend running (`uvicorn app.main:app --reload`)
- [ ] Startup shows ✅ Ollama connectivity message
- [ ] Audio upload works
- [ ] Minutes generated successfully

---

## 🔧 If Something Fails

### **"Cannot connect to Ollama"**
```bash
# Make sure Ollama is running in another terminal
ollama serve
```

### **"Model 'llama3' not found"**
```bash
# Pull the model
ollama pull llama3
```

### **"Transcription failed"**
```bash
# Make sure whisper is installed
pip install openai-whisper torch

# Or if using OpenAI API, set the key in .env
```

### **Stuck on "SUMMARIZING"**
- Check Ollama is actually running: `curl http://localhost:11434/api/tags`
- Check backend logs for the exact error
- Try a faster model: `ollama pull mistral` and set `OLLAMA_MODEL=mistral` in `.env`

---

## 📊 Expected Pipeline Time

- **Transcription** (Stage 1): ~1-5 seconds (depends on audio length)
- **Summarization** (Stage 2): ~10-30 seconds (depends on Ollama model)
- **PDF Generation** (Stage 3): ~2 seconds
- **Total**: ~13-37 seconds for a typical meeting

---

## 🆘 Full Debugging

See `MINUTES_GENERATION_TROUBLESHOOTING.md` for comprehensive troubleshooting guide.

---

## 🚀 Once Working

Edit and save changes to .env to:
- **Use faster model**: `OLLAMA_MODEL=mistral`
- **Use OpenAI Whisper API**: `WHISPER_MODE=api` + `OPENAI_API_KEY=...`
- **Increase upload limit**: `MAX_AUDIO_SIZE_MB=500`

Restart backend after any `.env` changes.
