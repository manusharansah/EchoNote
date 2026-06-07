import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MeetingStatus(str, enum.Enum):
    pending = "pending"
    transcribing = "transcribing"
    summarising = "summarising"
    separating = "separating"
    generating = "generating"
    done = "done"
    failed = "failed"


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(Enum(MeetingStatus), default=MeetingStatus.pending, nullable=False)
    audio_path = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    markdown = Column(Text, nullable=True)
    pdf_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="meetings")
    versions = relationship("Version", back_populates="meeting", cascade="all, delete-orphan")