"""
AI Processing Pipeline

Orchestrates the full flow for a meeting recording:
  1. TRANSCRIBING  → Whisper converts audio → text
  2. SUMMARIZING   → Ollama structures text → Markdown minutes
  3. GENERATING    → ReportLab converts Markdown → PDF
  4. DONE          → PDF path saved, frontend can download

This runs as a FastAPI BackgroundTask (no Redis/Celery needed).
Each stage updates `meeting.status` so the frontend can poll progress.
"""

import logging
from datetime import datetime, timezone

from app.db.database import SessionLocal
from app.models.meeting import Meeting, MeetingStatus
from app.services.whisper_service import transcribe_audio
from app.services.ollama_service import summarize_transcript
from app.services.pdf_generator import generate_pdf_from_markdown

logger = logging.getLogger(__name__)


def run_processing_pipeline(meeting_id: int) -> None:
    """
    Entry point called by BackgroundTasks.
    Opens its own DB session (background tasks run outside the request session).
    """
    db = SessionLocal()
    try:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            logger.error(f"Pipeline: meeting {meeting_id} not found")
            return

        # ── Stage 1: Transcribe ───────────────────────────────────────────────
        logger.info(f"[Meeting {meeting_id}] Stage 1: Transcribing audio...")
        _set_status(db, meeting, MeetingStatus.TRANSCRIBING)

        try:
            transcript = transcribe_audio(meeting.audio_path)
        except Exception as exc:
            _fail(db, meeting, f"Transcription failed: {exc}")
            return

        meeting.transcript = transcript
        db.commit()
        logger.info(f"[Meeting {meeting_id}] Transcript length: {len(transcript)} chars")

        # ── Stage 2: Summarize ────────────────────────────────────────────────
        logger.info(f"[Meeting {meeting_id}] Stage 2: Summarizing with Ollama...")
        _set_status(db, meeting, MeetingStatus.SUMMARIZING)

        try:
            markdown = summarize_transcript(transcript)
        except Exception as exc:
            _fail(db, meeting, f"Summarization failed: {exc}")
            return

        meeting.markdown = markdown
        db.commit()
        logger.info(f"[Meeting {meeting_id}] Markdown minutes generated ({len(markdown)} chars)")

        # ── Stage 3: Generate PDF ─────────────────────────────────────────────
        logger.info(f"[Meeting {meeting_id}] Stage 3: Generating PDF...")
        _set_status(db, meeting, MeetingStatus.GENERATING)

        try:
            pdf_path = generate_pdf_from_markdown(
                markdown_text=markdown,
                meeting_id=meeting.id,
                title=meeting.title,
            )
        except Exception as exc:
            _fail(db, meeting, f"PDF generation failed: {exc}")
            return

        # ── Done ──────────────────────────────────────────────────────────────
        meeting.pdf_path     = pdf_path
        meeting.status       = MeetingStatus.DONE
        meeting.completed_at = datetime.now(timezone.utc)
        meeting.error_message = None
        db.commit()
        logger.info(f"[Meeting {meeting_id}] ✅ Pipeline complete. PDF: {pdf_path}")

    except Exception as exc:
        logger.exception(f"[Meeting {meeting_id}] Unexpected pipeline error: {exc}")
        try:
            meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
            if meeting:
                _fail(db, meeting, f"Unexpected error: {exc}")
        except Exception:
            pass
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _set_status(db, meeting: Meeting, status: MeetingStatus):
    meeting.status = status
    db.commit()


def _fail(db, meeting: Meeting, reason: str):
    logger.error(f"[Meeting {meeting.id}] FAILED: {reason}")
    meeting.status        = MeetingStatus.FAILED
    meeting.error_message = reason
    db.commit()