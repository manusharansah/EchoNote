from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.db.database import get_db
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.schemas.meeting import MeetingOut, UpdateMarkdownRequest
from app.core.security import get_current_user
from app.services.pdf_generator import generate_pdf_from_markdown

router = APIRouter()


@router.get("/{meeting_id}/markdown")
def get_markdown(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the structured minutes in Markdown format for the editor."""
    meeting = _get_owned_done_meeting(meeting_id, current_user.id, db)
    return {"meeting_id": meeting.id, "markdown": meeting.markdown}


@router.put("/{meeting_id}/markdown", response_model=MeetingOut)
def update_markdown_and_regenerate_pdf(
    meeting_id: int,
    payload: UpdateMarkdownRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User edited the Markdown minutes and clicked 'Save Changes'.
    Saves the new Markdown and synchronously regenerates the PDF.
    Returns updated meeting with new pdf_path.
    """
    meeting = _get_owned_done_meeting(meeting_id, current_user.id, db)

    # Save updated markdown
    meeting.markdown = payload.markdown

    # Regenerate PDF synchronously (fast — no AI involved, just ReportLab)
    try:
        pdf_path = generate_pdf_from_markdown(
            markdown_text=payload.markdown,
            meeting_id=meeting.id,
            title=meeting.title,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(exc)}")

    # Remove old PDF if it differs
    if meeting.pdf_path and meeting.pdf_path != pdf_path and os.path.exists(meeting.pdf_path):
        os.remove(meeting.pdf_path)

    meeting.pdf_path = pdf_path
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}/pdf/download")
def download_pdf(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stream the generated PDF directly to the browser."""
    meeting = _get_owned_done_meeting(meeting_id, current_user.id, db)

    if not meeting.pdf_path or not os.path.exists(meeting.pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")

    safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in meeting.title)
    filename   = f"{safe_title[:50]}.pdf"

    return FileResponse(
        path=meeting.pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_owned_done_meeting(meeting_id: int, user_id: int, db: Session) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if meeting.status != MeetingStatus.DONE:
        raise HTTPException(
            status_code=400,
            detail=f"Minutes not ready yet. Current status: {meeting.status}",
        )
    return meeting