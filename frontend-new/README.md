# MeetScribe — Frontend

React + Vite frontend for the MeetScribe meeting minutes application.

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx    # JWT guard for routes
│   │   │   └── GoogleButton.jsx     # Google One-Tap OAuth button
│   │   ├── editor/
│   │   │   ├── EditorToolbar.jsx    # Tiptap WYSIWYG toolbar
│   │   │   └── EditorToolbar.module.css
│   │   └── recorder/
│   │       ├── WaveVisualizer.jsx   # Live audio level bars
│   │       └── WaveVisualizer.module.css
│   ├── hooks/
│   │   └── useRecorder.js          # MediaRecorder hook (start/pause/resume/stop)
│   ├── pages/
│   │   ├── SignIn.jsx + Auth.module.css
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx + Dashboard.module.css   # Meeting list
│   │   ├── Record.jsx + Record.module.css          # Recording page
│   │   └── Minutes.jsx + Minutes.module.css        # WYSIWYG editor + PDF export
│   ├── services/
│   │   └── api.js                  # Axios instance + all API calls
│   ├── store/
│   │   ├── authStore.js            # Zustand auth state
│   │   └── meetingStore.js         # Zustand meetings + minutes state
│   ├── styles/
│   │   └── globals.css             # CSS variables + design system
│   ├── App.jsx                     # Router + Toaster
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
```

### 3. Run dev server
```bash
npm run dev
```

Runs on **http://localhost:5173**. The Vite dev proxy forwards all `/api/*` requests to `http://localhost:8000`.

### 4. Production build
```bash
npm run build
# Output in dist/
```

---

## FastAPI CORS (required)

Add to your `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # add production domain too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → Credentials
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add `http://localhost:5173` to **Authorized JavaScript origins**
5. Copy the Client ID into `.env.local` as `VITE_GOOGLE_CLIENT_ID`
6. Your FastAPI `/api/auth/google` endpoint receives the `credential` JWT and should verify it with Google's public keys, then return `{ access_token: "..." }`

---

## API Contract (what the frontend expects)

### Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{email, password, full_name}` | `{id, email, full_name}` |
| POST | `/api/auth/login` | form: `{username, password}` | `{access_token, token_type}` |
| POST | `/api/auth/google` | `{token}` | `{access_token, token_type}` |
| GET | `/api/auth/me` | — | `{id, email, full_name}` |

### Meetings
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/meetings/` | — | `[{id, title, status, created_at}]` |
| POST | `/api/meetings/` | `{title}` | `{id, title, ...}` |
| GET | `/api/meetings/{id}` | — | `{id, title, ...}` |

### Audio
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/audio/upload/{meetingId}` | multipart `file` (.webm) | `{success: true}` |

### Minutes
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/minutes/generate/{meetingId}` | — | `{content: "markdown string"}` |
| GET | `/api/minutes/{meetingId}` | — | `{content: "markdown string"}` |
| POST | `/api/minutes/export/{meetingId}` | `{content: "html string"}` | PDF blob (`application/pdf`) |

---

## User Flow

```
/signup or /signin  →  Google OAuth or email+password
        ↓
/dashboard          →  list of meetings, create new meeting
        ↓
/record/:id         →  start → pause/resume → stop (auto-uploads webm)
                        → click "Generate Minutes" (calls backend pipeline)
        ↓
/minutes/:id        →  WYSIWYG Tiptap editor pre-filled with AI minutes
                        → "Save & Export PDF" → downloads PDF from backend
```
