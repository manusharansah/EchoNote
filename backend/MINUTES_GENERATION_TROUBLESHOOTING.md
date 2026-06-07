# Meeting Minutes Generation Troubleshooting Guide

## Issue: "Minutes Generation Failed"

Even though audio is being accepted, the meeting minutes generation is failing. This guide will help you identify and fix the issue.

---

## ✅ **Quick Checklist**

1. ✓ Ollama is installed and running
2. ✓ Ollama model is pulled (`ollama pull llama3`)
3. ✓ `.env` file exists with proper configuration
4. ✓ Database is initialized
5. ✓ Backend is running with proper logs

---

## **Stage-by-Stage Debugging**

### **Stage 1: Transcription**
**If failing here:** Voice-to-text conversion isn't working

**Check:**
```bash
# If using local Whisper (WHISPER_MODE=local):
python -c "import whisper; model = whisper.load_model('base'); print('✅ Whisper works')"

# If using OpenAI API (WHISPER_MODE=api):
# Verify OPENAI_API_KEY is set in .env
echo $OPENAI_API_KEY  # Should not be empty
```

**Common errors:**
- `ImportError: openai-whisper not installed` → Run: `pip install openai-whisper torch`
- `FFmpeg not found` → Install: `brew install ffmpeg` (Mac) or `apt install ffmpeg` (Linux)
- `OPENAI_API_KEY not set` → Set in `.env` file

---

### **Stage 2: Summarization (Minutes Generation)**
**If failing here:** Ollama isn't generating markdown from transcript

**Quick fix:**
```bash
# 1. Make sure Ollama is running
ollama serve

# 2. In another terminal, verify model is available
ollama list  # Should show llama3 (or your configured model)

# 3. If model not available, pull it
ollama pull llama3  # or your configured OLLAMA_MODEL
```

**Test connection:**
```bash
# Quick test to verify Ollama is reachable
curl http://localhost:11434/api/tags

# If error: Ollama is not running or not accessible
# If success: JSON response with available models
```

**Common errors:**
- `Cannot connect to Ollama at http://localhost:11434` 
  → Ollama isn't running. Start it: `ollama serve`
  
- `Ollama returned HTTP 404: model 'llama3' not found`
  → Model not pulled. Run: `ollama pull llama3`
  
- `Ollama request timed out`
  → Model is too slow or transcript is very long
  → Try smaller model: `ollama pull mistral` and set `OLLAMA_MODEL=mistral` in `.env`

- `Ollama returned empty response`
  → Model initialization issue. Try: `ollama pull {model}` again

---

### **Stage 3: PDF Generation**
**If failing here:** ReportLab isn't converting markdown to PDF

**Check:**
```bash
# Verify ReportLab is installed
python -c "import reportlab; print('✅ ReportLab installed')"
```

**Common errors:**
- `ImportError: No module named 'reportlab'` → Run: `pip install reportlab==4.2.2`

---

## **Configuration Setup**

### **1. Create `.env` file**
Copy the template and customize:
```bash
cp .env.example .env
```

Edit `.env` for your setup:
```env
# Speech-to-Text (choose one)
WHISPER_MODE=local           # Free, no API key needed
WHISPER_LOCAL_MODEL=base     # Download size: ~140 MB

# OR for OpenAI API (requires paid API key)
# WHISPER_MODE=api
# OPENAI_API_KEY=sk-your-key-here

# Minutes Generation (requires Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3          # Or: mistral, neural-chat, etc.
```

### **2. Install Ollama**
- Visit: https://ollama.ai
- Download and install for your OS
- Start Ollama: `ollama serve`
- Pull model: `ollama pull llama3`

### **3. Install dependencies**
```bash
pip install -r requirements.txt
```

---

## **Running the Backend**

```bash
# 1. Make sure Ollama is running in another terminal
ollama serve

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**You should see:**
```
INFO:     Checking Ollama connectivity...
INFO:     ✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
```

---

## **Real-Time Debugging**

### **Enable verbose logging**
Edit `.env`:
```env
LOG_LEVEL=DEBUG
```

### **Check backend logs**
The pipeline logs will show exactly where it fails:
```
[Meeting 1] Stage 1: Transcribing audio...
[Meeting 1] Transcript length: 5432 chars
[Meeting 1] Stage 2: Summarizing with Ollama...
[Meeting 1] ✅ Pipeline complete. PDF: ./storage/pdf/...
```

### **Query database for error messages**
```bash
python
>>> from app.db.database import SessionLocal
>>> from app.models.meeting import Meeting
>>> db = SessionLocal()
>>> meeting = db.query(Meeting).order_by(Meeting.id.desc()).first()
>>> print(f"Status: {meeting.status}")
>>> print(f"Error: {meeting.error_message}")
```

---

## **Common Scenarios**

### **Scenario 1: Audio uploads but minutes never generate**
**Likely cause:** Ollama not running
```bash
# Check
curl http://localhost:11434/api/tags
# If fails: Start Ollama
ollama serve
```

### **Scenario 2: Transcription works but summarization fails**
**Likely cause:** Model not pulled or too slow
```bash
# Check available models
ollama list

# Pull model if missing
ollama pull llama3

# Or try a faster model
ollama pull mistral
# Then set in .env: OLLAMA_MODEL=mistral
```

### **Scenario 3: Everything works locally but fails on production**
**Likely cause:** Environment variables not set or Ollama not accessible
- Verify `.env` is properly configured on server
- Ensure Ollama is running on the server
- Check network connectivity to Ollama
- Verify firewall allows connection to Ollama port (11434)

---

## **Recommended Model Sizes**

| Model | Speed | Accuracy | Size | RAM | Use Case |
|-------|-------|----------|------|-----|----------|
| mistral | ⚡ Very Fast | Good | 4.1GB | 8GB | Production, limited resources |
| neural-chat | ⚡ Fast | Good | 4.1GB | 8GB | Balanced, conversations |
| llama3 | ⚡ Medium | Great | 4.8GB | 12GB | Best quality (RECOMMENDED) |
| dolphin-mixtral | 🐢 Slow | Excellent | 26GB | 24GB | High-end machines only |

---

## **Support Commands**

```bash
# Test Ollama
curl http://localhost:11434/api/tags

# List running Ollama models
ollama list

# Pull new model
ollama pull mistral

# Stop Ollama
killall ollama

# Test Whisper
python -c "import whisper; print(whisper.available_models())"

# Test database
sqlite3 meeting_minutes.db ".tables"

# View recent meetings with errors
sqlite3 meeting_minutes.db "SELECT id, title, status, error_message FROM meetings ORDER BY id DESC LIMIT 5;"
```

---

## **Still Not Working?**

1. **Check backend logs** - Look for the exact error message
2. **Run `ollama serve` in foreground** - See if there are errors when requests arrive
3. **Test each component separately:**
   - Transcription: Upload audio directly to test
   - Summarization: Use `curl` to test Ollama API
   - PDF generation: Test with sample markdown
4. **Reset and retry:**
   ```bash
   rm -rf storage/  # Clear all generated files
   rm meeting_minutes.db  # Clear database
   python -c "from app.db.database import init_db; init_db()"  # Reinit
   ```

---

## **Questions?**

Check the backend startup logs first - they provide detailed hints about what's missing or misconfigured.
