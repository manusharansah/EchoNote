from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging

from app.db.database import init_db
from app.api.routes import auth, meetings, audio, minutes
from app.core.config import settings
from app.services.ollama_service import check_ollama_health

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    os.makedirs(settings.AUDIO_STORAGE_PATH, exist_ok=True)
    os.makedirs(settings.PDF_STORAGE_PATH, exist_ok=True)
    
    # Check Ollama connectivity on startup
    logger.info("Checking Ollama connectivity...")
    if not check_ollama_health():
        logger.warning(
            f"⚠️  Ollama is not reachable at {settings.OLLAMA_BASE_URL}. "
            f"Make sure Ollama is running. Minutes generation will fail until it's available. "
            f"To start Ollama, run: ollama serve"
        )
    else:
        logger.info(f"✅ Ollama is reachable at {settings.OLLAMA_BASE_URL} with model '{settings.OLLAMA_MODEL}'")
    
    yield


app = FastAPI(
    title="Meeting Minutes API",
    description="Backend for AI-powered meeting minutes generation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create PDF dir before mounting StaticFiles (required at import time)
os.makedirs(settings.PDF_STORAGE_PATH, exist_ok=True)
app.mount("/static/pdfs", StaticFiles(directory=settings.PDF_STORAGE_PATH), name="pdfs")

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(audio.router,    prefix="/api/audio",    tags=["Audio"])
app.include_router(minutes.router,  prefix="/api/minutes",  tags=["Minutes"])


@app.get("/health")
def health_check():
    return {"status": "ok"}