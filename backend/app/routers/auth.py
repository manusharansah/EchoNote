from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_google_auth_url,
    exchange_google_code,
    upsert_google_user,
)
from app.models.user import User
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user = register_user(payload.email, payload.password, payload.name, db)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(payload.email, payload.password, db)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.get("/google")
def google_login():
    """Redirect the browser to Google's OAuth consent screen."""
    return RedirectResponse(url=get_google_auth_url())


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Google redirects here with an authorization code."""
    try:
        google_data = await exchange_google_code(code)
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to exchange Google code")

    user = upsert_google_user(google_data, db)
    token = create_access_token({"sub": str(user.id)})

    # Redirect to frontend with token in query param.
    # Frontend reads it once, stores in memory/localStorage, then removes from URL.
    return RedirectResponse(
        url=f"{settings.frontend_url}/auth/callback?token={token}"
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user