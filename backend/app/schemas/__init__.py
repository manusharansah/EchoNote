"""Pydantic schemas for request/response validation"""
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserOut,
    TokenResponse,
    GoogleCallbackRequest,
)
from app.schemas.meeting import (
    MeetingCreate,
    MeetingOut,
    MeetingStatusOut,
    UpdateTitleRequest,
    UpdateMarkdownRequest,
)

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserOut",
    "TokenResponse",
    "GoogleCallbackRequest",
    "MeetingCreate",
    "MeetingOut",
    "MeetingStatusOut",
    "UpdateTitleRequest",
    "UpdateMarkdownRequest",
]
