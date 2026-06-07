# """
# Pipeline Runner — Orchestrates Steps 4a → 4b → 4c → 4d.
# Called as a FastAPI BackgroundTask after audio upload.
# Updates meeting status in DB at each stage.
# On any exception → sets status to failed with error message.
# """

# from datetime import datetime
# from sqlalchemy.orm import Session

# from app.models.meeting import Meeting, MeetingStatus
# from app.services.pipeline.transcribe import transcribe_audio
# from app.services.pipeline.summarise import summarise_transcript
# from app.services.pipeline.separate import separate_content
# from app.services.pipeline.generate_pdf import generate_pdf


# def run_pipeline(meeting_id: int, db: Session):
#     """
#     Main pipeline orchestrator.
#     Runs synchronously inside a background thread (FastAPI BackgroundTasks).
#     """
#     meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
#     if not meeting:
#         print(f"[pipeline] Meeting {meeting_id} not found — aborting")
#         return

#     print(f"[pipeline] Starting pipeline for meeting {meeting_id}: '{meeting.title}'")

#     try:
#         # ── Step 4a: Transcription ─────────────────────────
#         _set_status(db, meeting, MeetingStatus.transcribing)
#         print(f"[pipeline] Step 4a — Transcribing audio: {meeting.audio_path}")

#         transcript = transcribe_audio(meeting.audio_path)
#         meeting.transcript = transcript
#         db.commit()
#         print(f"[pipeline] Step 4a complete — {len(transcript)} chars transcribed")

#         # ── Step 4b: Summarisation ─────────────────────────
#         _set_status(db, meeting, MeetingStatus.summarising)
#         print(f"[pipeline] Step 4b — Summarising with Ollama ({len(transcript)} chars)")

#         markdown = summarise_transcript(transcript)
#         meeting.markdown = markdown
#         db.commit()
#         print(f"[pipeline] Step 4b complete — {len(markdown)} chars of markdown generated")

#         # ── Step 4c: Content Separation ───────────────────
#         _set_status(db, meeting, MeetingStatus.separating)
#         print(f"[pipeline] Step 4c — Separating content into sections")

#         sections = separate_content(markdown)
#         print(f"[pipeline] Step 4c complete")

#         # ── Step 4d: PDF Generation ────────────────────────
#         _set_status(db, meeting, MeetingStatus.generating)
#         print(f"[pipeline] Step 4d — Generating PDF")

#         pdf_path = generate_pdf(meeting_id, meeting.title, sections)
#         meeting.pdf_path = pdf_path
#         db.commit()
#         print(f"[pipeline] Step 4d complete — PDF at {pdf_path}")

#         # ── Done ───────────────────────────────────────────
#         meeting.status = MeetingStatus.done
#         meeting.completed_at = datetime.utcnow()
#         db.commit()
#         print(f"[pipeline] Pipeline complete for meeting {meeting_id} ✓")

#     except Exception as e:
#         error_msg = str(e)
#         print(f"[pipeline] FAILED at meeting {meeting_id}: {error_msg}")
#         meeting.status = MeetingStatus.failed
#         meeting.error_message = error_msg
#         db.commit()


# def run_regenerate_pdf(meeting_id: int, version_number: int, markdown: str,
#                        title: str, db: Session) -> str:
#     """
#     Regenerate PDF from edited markdown (used in Step 7 — save changes).
#     Skips steps 4a/4b/4c — goes straight to 4c+4d with the new markdown.
#     Returns the new pdf_path.
#     """
#     print(f"[pipeline] Regenerating PDF for meeting {meeting_id} v{version_number}")

#     sections = separate_content(markdown)

#     from app.services.pipeline.generate_pdf import generate_version_pdf
#     pdf_path = generate_version_pdf(meeting_id, version_number, title, sections)

#     print(f"[pipeline] PDF regenerated at {pdf_path}")
#     return pdf_path


# def _set_status(db: Session, meeting: Meeting, status: MeetingStatus):
#     """Helper — update status and flush to DB immediately."""
#     meeting.status = status
#     db.commit()
#     db.refresh(meeting)

"""
Pipeline Runner — Orchestrates Steps 4a → 4b → 4c → 4d.
Called as a FastAPI BackgroundTask after audio upload.
Updates meeting status in DB at each stage.
On any exception → sets status to failed with error message.
"""

import os
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.meeting import Meeting, MeetingStatus
from app.services.pipeline.transcribe import transcribe_audio
from app.services.pipeline.summarise import summarise_transcript
from app.services.pipeline.separate import separate_content
from app.services.pipeline.generate_pdf import generate_pdf, generate_version_pdf

# ── PDF storage directory ──────────────────────────────────
PDF_STORAGE_DIR = os.path.join("storage", "pdfs")


def run_pipeline(meeting_id: int, db: Session):
    """
    Main pipeline orchestrator.
    Runs synchronously inside a background thread (FastAPI BackgroundTasks).
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        print(f"[pipeline] Meeting {meeting_id} not found — aborting")
        return

    print(f"[pipeline] Starting pipeline for meeting {meeting_id}: '{meeting.title}'")

    try:
        # ── Step 4a: Transcription ─────────────────────────
        _set_status(db, meeting, MeetingStatus.transcribing)
        print(f"[pipeline] Step 4a — Transcribing audio: {meeting.audio_path}")

        transcript = transcribe_audio(meeting.audio_path)
        meeting.transcript = transcript
        db.commit()
        print(f"[pipeline] Step 4a complete — {len(transcript)} chars transcribed")

        # ── Step 4b: Summarisation ─────────────────────────
        _set_status(db, meeting, MeetingStatus.summarising)
        print(f"[pipeline] Step 4b — Summarising with Ollama ({len(transcript)} chars)")

        markdown = summarise_transcript(transcript)
        meeting.markdown = markdown
        db.commit()
        print(f"[pipeline] Step 4b complete — {len(markdown)} chars of markdown generated")

        # ── Step 4c: Content Separation ───────────────────
        _set_status(db, meeting, MeetingStatus.separating)
        print(f"[pipeline] Step 4c — Separating content into sections")

        sections = separate_content(markdown)
        print(f"[pipeline] Step 4c complete")

        # ── Step 4d: PDF Generation ────────────────────────
        _set_status(db, meeting, MeetingStatus.generating)
        print(f"[pipeline] Step 4d — Generating PDF")

        pdf_path = generate_pdf(meeting_id, meeting.title, sections, PDF_STORAGE_DIR)
        meeting.pdf_path = pdf_path
        db.commit()
        print(f"[pipeline] Step 4d complete — PDF at {pdf_path}")

        # ── Done ───────────────────────────────────────────
        meeting.status = MeetingStatus.done
        meeting.completed_at = datetime.utcnow()
        db.commit()
        print(f"[pipeline] Pipeline complete for meeting {meeting_id} ✓")

    except Exception as e:
        error_msg = str(e)
        print(f"[pipeline] FAILED at meeting {meeting_id}: {error_msg}")
        meeting.status = MeetingStatus.failed
        meeting.error_message = error_msg
        db.commit()


def run_regenerate_pdf(meeting_id: int, version_number: int, markdown: str,
                       title: str, db: Session) -> str:
    """
    Regenerate PDF from edited markdown (used in Step 7 — save changes).
    Skips steps 4a/4b/4c — goes straight to 4c+4d with the new markdown.
    Returns the new pdf_path.
    """
    print(f"[pipeline] Regenerating PDF for meeting {meeting_id} v{version_number}")

    sections = separate_content(markdown)

    pdf_path = generate_version_pdf(
        meeting_id, version_number, title, sections, PDF_STORAGE_DIR
    )

    print(f"[pipeline] PDF regenerated at {pdf_path}")
    return pdf_path


def _set_status(db: Session, meeting: Meeting, status: MeetingStatus):
    """Helper — update status and flush to DB immediately."""
    meeting.status = status
    db.commit()
    db.refresh(meeting)