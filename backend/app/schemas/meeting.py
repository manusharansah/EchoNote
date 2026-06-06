from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MeetingCreate(BaseModel):
    """Create a new meeting"""
    title: str = Field(..., min_length=1)


class MeetingOut(BaseModel):
    """Meeting response model"""
    id: int
    owner_id: int
    title: str
    status: str
    audio_path: Optional[str] = None
    pdf_path: Optional[str] = None
    transcript: Optional[str] = None
    markdown: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class MeetingStatusOut(BaseModel):
    """Meeting status response (lightweight polling)"""
    id: int
    status: str
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UpdateTitleRequest(BaseModel):
    """Update meeting title"""
    title: str = Field(..., min_length=1)


class UpdateMarkdownRequest(BaseModel):
    """Update meeting markdown minutes"""
    markdown: str = Field(..., min_length=1)
