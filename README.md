# 🎯 Meeting Minutes AI - National AI Hackathon 2026

> **Team Zapped** - AI-powered meeting transcription and minutes generation  
> **Technologies**: FastAPI, Whisper, Ollama, ReportLab, React

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
- ✅ **One-click recording** - Native browser recording
- ✅ **Automatic processing** - No manual steps required
- ✅ **Live progress tracking** - See pipeline status in real-time
- ✅ **Professional output** - PDF-ready minutes
- ✅ **Easy editing** - Markdown editor with live preview
- ✅ **Fast results** - 30-60 seconds per meeting
- ✅ **Privacy-first** - Local processing, no data leaks

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

---

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

---

## 🎉 Thank You!

Thanks for using Meeting Minutes AI. We hope this tool saves you hours of administrative work and improves your meeting productivity!

---
