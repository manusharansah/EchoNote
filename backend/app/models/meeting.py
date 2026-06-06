from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


class MeetingStatus(str, Enum):
    """Status values for a meeting processing pipeline"""
    PENDING = "pending"
    TRANSCRIBING = "transcribing"
    SUMMARIZING = "summarizing"
    GENERATING = "generating"
    DONE = "done"
    FAILED = "failed"


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(SQLEnum(MeetingStatus), default=MeetingStatus.PENDING, nullable=False, index=True)
    audio_path = Column(String(500), nullable=True)
    pdf_path = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    markdown = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="meetings")

    def __repr__(self):
        return f"<Meeting(id={self.id}, title='{self.title}', status={self.status})>"
