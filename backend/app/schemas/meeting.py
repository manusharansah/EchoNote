from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.meeting import MeetingStatus


class MeetingCreate(BaseModel):
    title: str


class MeetingResponse(BaseModel):
    id: int
    title: str
    status: MeetingStatus
    transcript: Optional[str] = None
    markdown: Optional[str] = None
    pdf_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MeetingListItem(BaseModel):
    id: int
    title: str
    status: MeetingStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    meetings: List[MeetingListItem]
    total: int


class MeetingStatusResponse(BaseModel):
    id: int
    status: MeetingStatus
    progress_pct: int
    error_message: Optional[str] = None


class MeetingMarkdownUpdate(BaseModel):
    markdown: str