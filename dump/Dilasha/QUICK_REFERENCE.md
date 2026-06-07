# ⚡ Quick Reference Card

## Setup (Copy-Paste)

```bash
# 1. Configure
cd backend
cp .env.example .env

# 2. Install
pip install -r requirements.txt

# 3. Install Ollama (only first time)
# Download from https://ollama.ai
# OR on Mac: brew install ollama
# OR on Linux: curl https://ollama.ai/install.sh | sh

# 4. Terminal 1: Start Ollama
ollama serve

# 5. Terminal 2: Start Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Expected Messages

✅ **Backend startup:**
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Audio upload successful:**
```
[Meeting 1] Stage 1: Transcribing audio...
[Meeting 1] Stage 2: Summarizing with Ollama...
[Meeting 1] Stage 3: Generating PDF...
[Meeting 1] ✅ Pipeline complete
```

## Common Commands

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Pull a model
ollama pull llama3          # Default (good)
ollama pull mistral         # Faster
ollama pull neural-chat     # Good balance

# List available models
ollama list

# View database meetings
sqlite3 backend/meeting_minutes.db "SELECT id, title, status FROM meetings;"

# Check last error
sqlite3 backend/meeting_minutes.db "SELECT error_message FROM meetings ORDER BY id DESC LIMIT 1;"

# View backend logs
tail -f backend/app.log
```

## Troubleshooting 30-Second Fixes

| Error | Fix |
|-------|-----|
| "Cannot connect to Ollama" | Run `ollama serve` in another terminal |
| "Model not found" | Run `ollama pull llama3` |
| Stuck on "SUMMARIZING" | Restart Ollama or try `OLLAMA_MODEL=mistral` |
| "Empty text" response | Audio too short - try longer recording |
| Timeout error | Model too slow - try `OLLAMA_MODEL=mistral` |

## .env Key Settings

```env
# Must Match - Change if Ollama running elsewhere
OLLAMA_BASE_URL=http://localhost:11434

# Choose model (smaller = faster)
OLLAMA_MODEL=llama3           # Good default
OLLAMA_MODEL=mistral          # Faster
OLLAMA_MODEL=neural-chat      # Balanced

# Transcription mode
WHISPER_MODE=local            # Free (downloads model)
WHISPER_MODE=api              # Requires OpenAI key
```

## Files You Need to Know

| File | Purpose |
|------|---------|
| `backend/.env` | Configuration (copy from `.env.example`) |
| `backend/app/main.py` | Backend startup (shows Ollama status) |
| `backend/app/services/pipeline.py` | Pipeline logic (shows stage progress) |
| `backend/meeting_minutes.db` | Database (stores meetings) |
| `backend/storage/pdf/` | Generated PDFs |
| `backend/storage/audio/` | Uploaded audio files |

## Debug Flow

```
1. Backend startup shows ✅ Ollama status
   ↓
2. Upload audio → Check status endpoint
   ↓
3. Backend logs show "Stage 1: Transcribing"
   ↓
4. Logs show "Stage 2: Summarizing" 
   ↓
5. Logs show "Stage 3: Generating"
   ↓
6. Status becomes DONE (or FAILED with error message)
   ↓
7. If FAILED: Check error_message in meeting record
```

## Performance

- Transcription: 1-5 seconds
- Summarization: 10-30 seconds (depends on Ollama model)
- PDF generation: 2 seconds
- Total: ~13-37 seconds

## Faster Setup

If you only care about getting it working fast:
1. `cp backend/.env.example backend/.env`
2. `pip install -r backend/requirements.txt`
3. Ollama: `ollama serve`
4. Backend: `uvicorn backend/app/main:app --reload`
5. Upload audio via frontend

---

**Need more help?** See `START_HERE.md` for full documentation.
