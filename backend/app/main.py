import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.database import engine, Base

settings = get_settings()

# ── Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("meeting_minutes")

# ── Storage directories ────────────────────────────────────
os.makedirs(settings.storage_audio_dir, exist_ok=True)
os.makedirs(settings.storage_pdf_dir, exist_ok=True)
os.makedirs("./storage/db", exist_ok=True)

# ── Register all models then create tables ─────────────────
import app.models  # noqa: F401, E402
Base.metadata.create_all(bind=engine)

# ── FastAPI app ────────────────────────────────────────────
app = FastAPI(
    title="Meeting Minutes AI",
    description="Automatic meeting transcription, summarisation, and PDF generation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────
from app.routers import auth, meetings, versions  # noqa: E402

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
app.include_router(versions.router, prefix="/meetings", tags=["Versions"])


# ── Exception handlers ────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = [f"{' → '.join(str(l) for l in e['loc'])}: {e['msg']}" for e in errors]
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "detail": messages},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ── Startup event ─────────────────────────────────────────
@app.on_event("startup")
async def startup_checks():
    import httpx
    logger.info("Meeting Minutes AI starting up...")

    # Check Ollama connectivity
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{settings.ollama_base_url}/api/tags", timeout=5)
            models = [m["name"] for m in res.json().get("models", [])]
            if settings.ollama_model not in " ".join(models):
                logger.warning(
                    f"Ollama model '{settings.ollama_model}' may not be pulled. "
                    f"Run: ollama pull {settings.ollama_model}"
                )
            else:
                logger.info(f"Ollama ✓ — model '{settings.ollama_model}' ready")
    except Exception:
        logger.warning(
            f"Ollama not reachable at {settings.ollama_base_url}. "
            "Pipeline will fail at Step 4b. Run: ollama serve"
        )

    logger.info("Startup complete ✓")


# ── Health check ───────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "ollama_model": settings.ollama_model,
        "storage_audio": settings.storage_audio_dir,
        "storage_pdf": settings.storage_pdf_dir,
    }