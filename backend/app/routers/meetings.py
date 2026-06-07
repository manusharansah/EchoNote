import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.models.version import Version
from app.schemas.meeting import (
    MeetingCreate, MeetingResponse, MeetingListResponse,
    MeetingListItem, MeetingStatusResponse, MeetingMarkdownUpdate,
)
from app.services.auth_service import get_current_user
from app.services.pipeline_runner import run_pipeline, run_regenerate_pdf
from app.config import get_settings

settings = get_settings()
router = APIRouter()

PROGRESS_MAP = {
    MeetingStatus.pending: 0,
    MeetingStatus.transcribing: 20,
    MeetingStatus.summarising: 45,
    MeetingStatus.separating: 70,
    MeetingStatus.generating: 85,
    MeetingStatus.done: 100,
    MeetingStatus.failed: -1,
}

ALLOWED_EXTENSIONS = {".webm", ".mp4", ".wav", ".ogg", ".oga", ".mp3", ".m4a"}


@router.post("", response_model=MeetingResponse, status_code=201)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    meeting = Meeting(owner_id=current_user.id, title=payload.title.strip())
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("", response_model=MeetingListResponse)
def list_meetings(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Meeting)
        .filter(Meeting.owner_id == current_user.id)
        .order_by(Meeting.created_at.desc())
    )
    total = query.count()
    meetings = query.offset(skip).limit(limit).all()
    return MeetingListResponse(
        meetings=[MeetingListItem.model_validate(m) for m in meetings],
        total=total,
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_meeting(meeting_id, current_user.id, db)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    for path in [meeting.audio_path, meeting.pdf_path]:
        if path and os.path.exists(path):
            os.remove(path)
    db.delete(meeting)
    db.commit()


@router.post("/{meeting_id}/upload", response_model=MeetingResponse)
async def upload_audio(
    meeting_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)

    if meeting.status not in (MeetingStatus.pending, MeetingStatus.failed):
        raise HTTPException(status_code=400, detail="Meeting already has audio processing")

    # Validate extension
    ext = os.path.splitext(file.filename or "audio.webm")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # Validate size (200MB)
    MAX_SIZE = 200 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 200MB.")

    # Save audio file to disk
    audio_filename = f"{meeting_id}{ext}"
    audio_path = os.path.join(settings.storage_audio_dir, audio_filename)
    with open(audio_path, "wb") as f:
        f.write(contents)

    # Update meeting record
    meeting.audio_path = audio_path
    meeting.status = MeetingStatus.pending
    meeting.error_message = None
    db.commit()
    db.refresh(meeting)

    # ── Trigger pipeline as background task ───────────────
    # We create a NEW db session for the background task because
    # FastAPI's request-scoped session closes when the request ends.
    background_tasks.add_task(_run_pipeline_with_new_session, meeting_id)

    return meeting


@router.get("/{meeting_id}/status", response_model=MeetingStatusResponse)
def get_status(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    return MeetingStatusResponse(
        id=meeting.id,
        status=meeting.status,
        progress_pct=PROGRESS_MAP.get(meeting.status, 0),
        error_message=meeting.error_message,
    )


@router.get("/{meeting_id}/markdown")
def get_markdown(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    if not meeting.markdown:
        raise HTTPException(status_code=404, detail="Markdown not yet generated")
    return {"markdown": meeting.markdown}


@router.put("/{meeting_id}/markdown", response_model=MeetingResponse)
def update_markdown(
    meeting_id: int,
    payload: MeetingMarkdownUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    meeting.markdown = payload.markdown
    db.commit()
    db.refresh(meeting)
    return meeting


@router.post("/{meeting_id}/versions", status_code=201)
def save_version(
    meeting_id: int,
    payload: MeetingMarkdownUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save current markdown as a new version snapshot and regenerate PDF."""
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)

    # Get next version number
    last_version = (
        db.query(Version)
        .filter(Version.meeting_id == meeting_id)
        .order_by(Version.version_number.desc())
        .first()
    )
    next_version_number = (last_version.version_number + 1) if last_version else 1

    # Regenerate PDF from new markdown
    pdf_path = run_regenerate_pdf(
        meeting_id, next_version_number, payload.markdown, meeting.title, db
    )

    # Save version snapshot
    version = Version(
        meeting_id=meeting_id,
        version_number=next_version_number,
        markdown_snapshot=payload.markdown,
        pdf_path=pdf_path,
    )
    db.add(version)

    # Update meeting's current markdown and pdf
    meeting.markdown = payload.markdown
    meeting.pdf_path = pdf_path
    db.commit()
    db.refresh(version)

    return {
        "version_number": version.version_number,
        "pdf_path": pdf_path,
        "created_at": version.created_at,
    }


@router.get("/{meeting_id}/pdf")
def get_pdf(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    if not meeting.pdf_path or not os.path.exists(meeting.pdf_path):
        raise HTTPException(status_code=404, detail="PDF not yet generated")
    return FileResponse(
        meeting.pdf_path,
        media_type="application/pdf",
        filename=f"minutes_{meeting_id}.pdf",
    )


# ── Helpers ────────────────────────────────────────────────
def _get_owned_meeting(meeting_id: int, user_id: int, db: Session) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return meeting


def _run_pipeline_with_new_session(meeting_id: int):
    """
    Creates a fresh DB session for the background task.
    Required because the request-scoped session is closed by the time
    the background task runs.
    """
    db = SessionLocal()
    try:
        run_pipeline(meeting_id, db)
    finally:
        db.close()