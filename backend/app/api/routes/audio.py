from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import uuid, os, shutil

from app.db.database import get_db
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.schemas.meeting import MeetingOut
from app.core.security import get_current_user
from app.core.config import settings
from app.services.pipeline import run_processing_pipeline

router = APIRouter()

# Allowed audio MIME types (browser MediaRecorder typically produces these)
ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
}


@router.post("/upload/{meeting_id}", response_model=MeetingOut)
async def upload_audio(
    meeting_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload audio for a meeting and kick off the AI processing pipeline.
    The endpoint returns immediately; processing happens in the background.
    Frontend polls GET /meetings/{id}/status to track progress.
    """
    # 1. Validate meeting ownership
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if meeting.status not in (MeetingStatus.PENDING, MeetingStatus.FAILED):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot upload audio for a meeting in '{meeting.status}' state",
        )

    # 2. Validate content type
    content_type = (file.content_type or "").split(";")[0].strip()
    # Be lenient — browsers sometimes send odd MIME types for recorded audio
    if content_type and content_type not in ALLOWED_AUDIO_TYPES and not content_type.startswith("audio/"):
        raise HTTPException(status_code=415, detail=f"Unsupported audio type: {file.content_type}")

    # 3. Validate file size (stream to disk, reject if too large)
    max_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
    audio_filename = f"{uuid.uuid4()}.webm"
    audio_path = os.path.join(settings.AUDIO_STORAGE_PATH, audio_filename)
    os.makedirs(settings.AUDIO_STORAGE_PATH, exist_ok=True)

    bytes_written = 0
    try:
        with open(audio_path, "wb") as dest:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                bytes_written += len(chunk)
                if bytes_written > max_bytes:
                    dest.close()
                    os.remove(audio_path)
                    raise HTTPException(
                        status_code=413,
                        detail=f"Audio file exceeds {settings.MAX_AUDIO_SIZE_MB} MB limit",
                    )
                dest.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        if os.path.exists(audio_path):
            os.remove(audio_path)
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {str(exc)}")

    # 4. Update meeting record
    meeting.audio_path = audio_path
    meeting.status     = MeetingStatus.PENDING
    db.commit()
    db.refresh(meeting)

    # 5. Kick off background pipeline (transcribe → summarize → generate PDF)
    background_tasks.add_task(run_processing_pipeline, meeting_id=meeting.id)

    return meeting