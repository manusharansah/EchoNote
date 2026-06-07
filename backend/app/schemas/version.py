from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VersionResponse(BaseModel):
    id: int
    meeting_id: int
    version_number: int
    markdown_snapshot: str
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VersionListItem(BaseModel):
    id: int
    version_number: int
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True