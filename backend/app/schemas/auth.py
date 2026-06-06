from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="At least 8 characters")
    full_name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """User response model (no password)"""
    id: int
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    auth_provider: str
    google_id: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Token response after login/register"""
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleCallbackRequest(BaseModel):
    """Google OAuth callback request"""
    code: str
