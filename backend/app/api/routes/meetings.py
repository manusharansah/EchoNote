from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.schemas.meeting import MeetingCreate, MeetingOut, MeetingStatusOut, UpdateTitleRequest
from app.core.security import get_current_user

router = APIRouter()


@router.post("/", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new meeting record. Audio upload happens separately via /audio/upload."""
    meeting = Meeting(owner_id=current_user.id, title=payload.title)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/", response_model=List[MeetingOut])
def list_meetings(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all meetings for the authenticated user, newest first."""
    return (
        db.query(Meeting)
        .filter(Meeting.owner_id == current_user.id)
        .order_by(Meeting.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    return meeting


@router.get("/{meeting_id}/status", response_model=MeetingStatusOut)
def get_meeting_status(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lightweight polling endpoint — frontend polls this to track processing progress."""
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    return meeting


@router.patch("/{meeting_id}/title", response_model=MeetingOut)
def update_title(
    meeting_id: int,
    payload: UpdateTitleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)
    meeting.title = payload.title
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import os
    meeting = _get_owned_meeting(meeting_id, current_user.id, db)

    # Clean up files from disk
    for path in [meeting.audio_path, meeting.pdf_path]:
        if path and os.path.exists(path):
            os.remove(path)

    db.delete(meeting)
    db.commit()


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_owned_meeting(meeting_id: int, user_id: int, db: Session) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return meeting