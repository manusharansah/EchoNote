from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.version import Version
from app.schemas.version import VersionResponse, VersionListItem
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/{meeting_id}/versions", response_model=list[VersionListItem])
def list_versions(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_ownership(meeting_id, current_user.id, db)
    versions = (
        db.query(Version)
        .filter(Version.meeting_id == meeting_id)
        .order_by(Version.version_number.asc())
        .all()
    )
    return versions


@router.get("/{meeting_id}/versions/{version_number}", response_model=VersionResponse)
def get_version(
    meeting_id: int,
    version_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_ownership(meeting_id, current_user.id, db)
    version = (
        db.query(Version)
        .filter(
            Version.meeting_id == meeting_id,
            Version.version_number == version_number,
        )
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


@router.get("/{meeting_id}/versions/{version_number}/pdf")
def get_version_pdf(
    meeting_id: int,
    version_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_ownership(meeting_id, current_user.id, db)
    version = (
        db.query(Version)
        .filter(
            Version.meeting_id == meeting_id,
            Version.version_number == version_number,
        )
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    if not version.pdf_path or not os.path.exists(version.pdf_path):
        raise HTTPException(status_code=404, detail="PDF not available for this version")
    return FileResponse(
        version.pdf_path,
        media_type="application/pdf",
        filename=f"minutes_{meeting_id}_v{version_number}.pdf",
    )


@router.get("/{meeting_id}/diff")
def get_diff(
    meeting_id: int,
    v1: int,
    v2: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the markdown content of two versions for frontend diff rendering."""
    _assert_ownership(meeting_id, current_user.id, db)

    def fetch(vn: int) -> Version:
        v = db.query(Version).filter(
            Version.meeting_id == meeting_id,
            Version.version_number == vn,
        ).first()
        if not v:
            raise HTTPException(status_code=404, detail=f"Version {vn} not found")
        return v

    version1 = fetch(v1)
    version2 = fetch(v2)
    return {
        "v1": {"version_number": v1, "markdown": version1.markdown_snapshot, "created_at": version1.created_at},
        "v2": {"version_number": v2, "markdown": version2.markdown_snapshot, "created_at": version2.created_at},
    }


# ── Helper ─────────────────────────────────────────────────
def _assert_ownership(meeting_id: int, user_id: int, db: Session):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")