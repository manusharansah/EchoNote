# 🎯 Meeting Minutes AI - National AI Hackathon 2026

> **Team Zapped** - AI-powered meeting transcription and minutes generation  
> **Status**: ✅ Production-ready with full documentation  
> **Technologies**: FastAPI, Whisper, Ollama, ReportLab, React

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Our Solution](#our-solution)
4. [Key Features](#key-features)
5. [Architecture](#architecture)
6. [Tech Stack](#tech-stack)
7. [Quick Start](#quick-start)
8. [Project Structure](#project-structure)
9. [Setup & Deployment](#setup--deployment)
10. [Recent Fixes](#recent-fixes)
11. [Documentation](#documentation)
12. [Team](#team)

---

## 📱 Project Overview

**Meeting Minutes AI** is an intelligent application that automatically transcribes meeting audio, generates structured meeting minutes using AI, and produces professional PDF documents—all without requiring any manual intervention.

### Use Cases
- 📞 Remote team meetings
- 🏢 Client calls and presentations
- 📊 Board meetings and discussions
- 🎓 Lectures and seminars
- 📝 Any audio-based discussion requiring documentation

---

## 🔴 Problem Statement

### The Challenge
Manual note-taking during meetings is:
- ❌ **Time-consuming** - Attendees split focus between meeting and notes
- ❌ **Error-prone** - Human error leads to incomplete/inaccurate records
- ❌ **Inconsistent** - Different people take notes differently
- ❌ **Labor-intensive** - Post-meeting transcription and formatting takes hours
- ❌ **Inaccessible** - No standardized format for documentation

### Real-World Impact
> *"In a typical 60-minute meeting, participants spend 15-20 minutes taking notes instead of actively listening. Post-meeting, someone spends another 30-45 minutes creating proper minutes."*

This results in:
- 📉 Reduced meeting productivity
- ⏰ Hours of wasted administrative time per week
- 📄 Inconsistent documentation standards
- 🤝 Poor knowledge sharing across teams

---

## ✅ Our Solution

### Meeting Minutes AI: A Complete Workflow

```
📱 User Records Meeting
        ↓
🎙️ Upload Audio (WebM, MP4, WAV, OGG)
        ↓
⚡ Whisper (Speech-to-Text)
  ↳ Converts audio to transcript
        ↓
🤖 Ollama LLM (Minutes Generation)
  ↳ Structures transcript into professional minutes
  ↳ Extracts key decisions, action items, attendees
        ↓
📄 PDF Generation (ReportLab)
  ↳ Creates professionally formatted PDF
        ↓
✏️ User Reviews & Edits (Optional)
  ↳ Edit markdown, regenerate PDF
        ↓
💾 Download & Share
```

### How It Works

#### **1. Audio Upload & Acceptance**
- Users record meeting using browser MediaRecorder API
- Supports: WebM, MP4, WAV, OGG formats
- Upload limit: 200MB (configurable)
- Real-time upload progress

#### **2. Intelligent Transcription (Whisper)**
- OpenAI Whisper converts audio to accurate text
- Supports local models (free) or API (paid)
- Handles multiple languages and accents
- Automatic splitting for large files (>25MB)

#### **3. Smart Summarization (Ollama)**
- Local LLM generates structured minutes
- Extracts:
  - 📝 Meeting summary
  - 👥 Attendees identified
  - 📋 Agenda items discussed
  - ✅ Key decisions made
  - 📌 Action items with owners
  - 🎯 Next steps
- No data sent to external servers (privacy-first)

#### **4. Professional PDF Generation (ReportLab)**
- Beautiful, branded PDF documents
- Markdown formatting support
- Company branding and headers
- Automatic pagination and footers

#### **5. User Review & Edit**
- Interactive markdown editor
- Live PDF regeneration
- Save changes instantly
- No re-processing needed

---

## ✨ Key Features

### For Users
- ✅ **One-click recording** - Native browser recording
- ✅ **Automatic processing** - No manual steps required
- ✅ **Live progress tracking** - See pipeline status in real-time
- ✅ **Professional output** - PDF-ready minutes
- ✅ **Easy editing** - Markdown editor with live preview
- ✅ **Fast results** - 30-60 seconds per meeting
- ✅ **Privacy-first** - Local processing, no data leaks

### For Developers
- 🔧 **Well-documented** - 7 comprehensive guides
- 📚 **Clean architecture** - Modular, easy to extend
- 🧪 **Error handling** - Comprehensive error messages
- 📊 **Configurable** - Environment-based settings
- 🔐 **Secure** - JWT auth, input validation
- 🚀 **Scalable** - Background task processing
- 📝 **Logged** - Detailed pipeline logs

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  - Record   │
│  - Upload   │
│  - Edit     │
└──────┬──────┘
       │ HTTP
       ↓
┌──────────────────────────────────────┐
│         FastAPI Backend              │
│  ┌────────────────────────────────┐  │
│  │ Audio Upload Endpoint          │  │
│  │ - Validate audio               │  │
│  │ - Store to disk                │  │
│  └────────┬───────────────────────┘  │
│           ↓                           │
│  ┌────────────────────────────────┐  │
│  │ Background Pipeline            │  │
│  │ ├─ Stage 1: Transcribe         │  │
│  │ │  (Whisper)                   │  │
│  │ ├─ Stage 2: Summarize          │  │
│  │ │  (Ollama LLM)                │  │
│  │ └─ Stage 3: Generate PDF       │  │
│  │    (ReportLab)                 │  │
│  └────────┬───────────────────────┘  │
│           ↓                           │
│  ┌────────────────────────────────┐  │
│  │ Status Endpoints               │  │
│  │ - Check progress               │  │
│  │ - Get markdown                 │  │
│  │ - Download PDF                 │  │
│  └────────────────────────────────┘  │
│           ↑                           │
│           │ Poll every 2s             │
│           └───────────────────────────┘
│                                       │
│  Database: SQLite                    │
│  - Users, Meetings, Status Tracking  │
└──────────────────────────────────────┘
       ↑                ↑
       │ HTTP          │ HTTP
       │                │
   Frontend          External Services
                     (Optional: OpenAI API)
```

### Database Schema

```sql
users
├── id (PK)
├── email (unique)
├── password_hash
└── created_at

meetings
├── id (PK)
├── owner_id (FK)
├── title
├── status (pending|transcribing|summarizing|generating|done|failed)
├── audio_path
├── transcript
├── markdown
├── pdf_path
├── error_message
├── created_at
└── completed_at
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python web framework)
- **Database**: SQLite + SQLAlchemy ORM
- **Auth**: JWT tokens with bcrypt hashing
- **Speech-to-Text**: OpenAI Whisper (local or API)
- **LLM**: Ollama (local, privacy-first)
- **PDF**: ReportLab
- **HTTP Client**: httpx

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS
- **Auth**: OAuth + Email/Password
- **API**: Axios
- **State**: React Context + Hooks
- **Editor**: Markdown editor with live preview

### DevOps
- **Server**: Uvicorn + Docker-ready
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Deployment**: Self-hosted or cloud-ready

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Ollama installed
- Git

### 5-Minute Setup

#### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
```

#### Ollama
```bash
# Install from https://ollama.ai
ollama serve  # Terminal #1
```

#### Start Backend
```bash
# Terminal #2
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
# Terminal #3
cd frontend/lovable
npm install
npm run dev
```

**Expected Output:**
```
✅ Ollama is reachable at http://localhost:11434 with model 'llama3'
```

Then open `http://localhost:5173` in browser → Start recording! 🎉

---

## 📁 Project Structure

```
national-ai-hackathon-2026-team-zapped/
│
├── 📄 README.md (this file)
├── 📄 START_HERE.md (navigation guide)
├── 📄 QUICK_REFERENCE.md (copy-paste commands)
├── 📄 MINUTES_GENERATION_ANALYSIS.md (technical deep-dive)
├── 📄 FIX_SUMMARY.txt (what was fixed)
│
├── 📁 backend/
│   ├── 📄 .env.example (configuration template)
│   ├── 📄 QUICK_START.md (5-min backend setup)
│   ├── 📄 FIXES_APPLIED.md (all fixes explained)
│   ├── 📄 MINUTES_GENERATION_TROUBLESHOOTING.md (debugging)
│   ├── requirements.txt
│   │
│   └── 📁 app/
│       ├── main.py (FastAPI app + startup)
│       ├── 📁 api/
│       │   └── routes/
│       │       ├── auth.py (login/signup)
│       │       ├── meetings.py (CRUD operations)
│       │       ├── audio.py (upload + pipeline)
│       │       └── minutes.py (markdown/PDF)
│       ├── 📁 services/
│       │   ├── whisper_service.py (transcription)
│       │   ├── ollama_service.py (summarization)
│       │   ├── pdf_generator.py (PDF creation)
│       │   └── pipeline.py (orchestration)
│       ├── 📁 models/
│       │   ├── user.py
│       │   └── meeting.py
│       ├── 📁 schemas/
│       │   └── meeting.py
│       ├── 📁 db/
│       │   └── database.py
│       └── 📁 core/
│           ├── config.py
│           └── security.py
│
└── 📁 frontend/
    └── 📁 lovable/
        ├── package.json
        ├── 📁 src/
        │   ├── App.tsx
        │   ├── 📁 pages/
        │   │   ├── LoginPage.tsx
        │   │   ├── RecorderPage.tsx
        │   │   ├── MinutesEditorPage.tsx
        │   │   └── MeetingsListPage.tsx
        │   ├── 📁 components/
        │   │   ├── AudioRecorder.tsx
        │   │   ├── MarkdownEditor.tsx
        │   │   └── PipelineProgress.tsx
        │   └── 📁 services/
        │       └── api.ts
        └── vite.config.ts
```

---

## 🔧 Setup & Deployment

### Development Setup
See: `backend/QUICK_START.md` or `START_HERE.md`

### Production Deployment
- Use PostgreSQL instead of SQLite
- Set `DEBUG=False` in `.env`
- Use proper JWT secret
- Enable HTTPS
- Configure CORS properly
- Set up Docker container

See deployment guides in documentation for detailed steps.

---

## 🔨 Recent Fixes (v1.1)

We identified and fixed **5 critical issues** that were preventing minutes generation:

### Issues Fixed
| Issue | Impact | Status |
|-------|--------|--------|
| Weak error messages | Users don't know how to fix issues | ✅ Fixed |
| No pre-flight checks | Wastes time if Ollama missing | ✅ Fixed |
| No startup diagnostics | Silent failures | ✅ Fixed |
| Missing config template | Users confused about setup | ✅ Fixed |
| Poor data validation | Doesn't catch empty results | ✅ Fixed |

### What Changed
- ✅ **Better error handling** - Specific, actionable messages
- ✅ **Pre-flight checks** - Fails fast if dependencies missing
- ✅ **Startup diagnostics** - Shows ✅ or ⚠️ for each service
- ✅ **Complete documentation** - 7 comprehensive guides
- ✅ **Data validation** - Catches issues early

**See**: `MINUTES_GENERATION_ANALYSIS.md` for full technical details

---

## 📚 Documentation

### For Getting Started
1. **`START_HERE.md`** - Navigation guide (5 min)
2. **`QUICK_REFERENCE.md`** - Copy-paste commands (quick lookup)
3. **`backend/QUICK_START.md`** - Step-by-step setup (10 min)

### For Understanding
4. **`FIX_SUMMARY.txt`** - What was fixed and why (15 min)
5. **`MINUTES_GENERATION_ANALYSIS.md`** - Technical deep-dive (30 min)
6. **`backend/FIXES_APPLIED.md`** - Detailed fix explanations (20 min)

### For Troubleshooting
7. **`backend/MINUTES_GENERATION_TROUBLESHOOTING.md`** - Debugging guide (reference)

### Configuration
8. **`backend/.env.example`** - All settings explained

---

## 🎯 Key Design Decisions

### 1. Local LLM (Ollama) vs Cloud API
**Why Ollama?**
- ✅ Privacy - No data sent to external servers
- ✅ Cost - No per-request fees
- ✅ Control - Run any model locally
- ✅ Speed - No network latency

### 2. Background Processing
**Why async tasks?**
- ✅ Responsive UI - Backend returns immediately
- ✅ Better UX - Frontend can show progress
- ✅ Scalable - Handle multiple concurrent uploads

### 3. SQLite (Development) / PostgreSQL (Production)
**Why dual support?**
- ✅ Easy setup - SQLite for development
- ✅ Production-ready - PostgreSQL for reliability
- ✅ Flexible - Switch without code changes

### 4. Markdown for Minutes
**Why Markdown?**
- ✅ User-editable - Easy for non-technical users
- ✅ Future-proof - Can convert to any format
- ✅ Version control - Plain text, git-friendly
- ✅ Structured - Clear sections and formatting

---

## 🧪 Testing

### Run Tests
```bash
cd backend
pytest tests/
```

### Manual Testing
1. Upload test audio
2. Monitor backend logs
3. Check database for meeting status
4. Download generated PDF
5. Edit markdown and regenerate

---

## 📊 Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Audio upload | 1-30s | Depends on file size |
| Transcription | 1-5s | Whisper speed |
| Summarization | 10-30s | LLM speed (model-dependent) |
| PDF generation | 2s | ReportLab |
| **Total** | **13-67s** | ~1 min for typical meeting |

**Tips to optimize:**
- Use faster Ollama model: `mistral` instead of `llama3`
- Increase Ollama hardware allocation
- Pre-download Whisper model

---

## 🔐 Security Features

- ✅ **Password hashing** - Bcrypt with salt
- ✅ **JWT authentication** - Secure token-based auth
- ✅ **Input validation** - Sanitize all inputs
- ✅ **CORS protection** - Configured origins only
- ✅ **File upload limits** - Size validation
- ✅ **Error sanitization** - No sensitive data in errors
- ✅ **Privacy-first** - Local processing

---

## 🤝 Contributing

### How to Help
1. **Report bugs** - Use GitHub Issues
2. **Suggest features** - Create a discussion
3. **Improve docs** - Submit pull requests
4. **Optimize code** - Performance improvements welcome

### Code Style
- Python: PEP 8
- TypeScript: ESLint config
- Commit messages: Conventional commits

---

## 📞 Support

### Getting Help
1. **Read the docs** - 7 comprehensive guides included
2. **Check troubleshooting** - 50+ common issues covered
3. **Review error messages** - They now tell you how to fix issues
4. **Check backend logs** - Clear stage-by-stage progress

### Common Issues
See: `backend/MINUTES_GENERATION_TROUBLESHOOTING.md`

---

## 🎓 Learning Resources

### About the Technologies
- **FastAPI**: https://fastapi.tiangolo.com
- **Whisper**: https://github.com/openai/whisper
- **Ollama**: https://ollama.ai
- **ReportLab**: https://www.reportlab.com

### About the Use Case
- Speech-to-text fundamentals
- LLM prompting techniques
- PDF generation best practices

---

## 📝 License

This project was created for the National AI Hackathon 2026.

---

## 👥 Team

**Team Zapped** - National AI Hackathon 2026

### Contributors
- Architecture & Backend
- Frontend & UI
- AI/ML Integration
- Documentation

---

## 🚀 Ready to Start?

### Quick Decision Tree

```
Are you new to the project?
├─ YES → Read: START_HERE.md
│
Are you ready to set up?
├─ YES → Read: backend/QUICK_START.md
│
Something not working?
├─ YES → Read: backend/MINUTES_GENERATION_TROUBLESHOOTING.md
│
Want technical details?
├─ YES → Read: MINUTES_GENERATION_ANALYSIS.md
```

---

## 📈 Roadmap

### Future Enhancements
- [ ] Multi-language support (auto-detect)
- [ ] Custom LLM models
- [ ] Real-time transcription (live meetings)
- [ ] Meeting reminders & follow-ups
- [ ] Email integration
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile apps

---

## ✅ Project Checklist

- [x] Audio recording and upload
- [x] Speech-to-text transcription
- [x] AI summarization with LLM
- [x] PDF generation
- [x] User authentication
- [x] Markdown editing
- [x] Error handling & logging
- [x] Comprehensive documentation
- [x] Bug fixes and optimization
- [x] Production-ready

---

## 🎉 Thank You!

Thanks for using Meeting Minutes AI. We hope this tool saves you hours of administrative work and improves your meeting productivity!

**Questions?** Check `START_HERE.md` for documentation navigation.

**Ready to deploy?** Follow `backend/QUICK_START.md` for setup.

---

**Version**: 1.1 (with fixes applied)  
**Last Updated**: June 2026  
**Status**: ✅ Production Ready