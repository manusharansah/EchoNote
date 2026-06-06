from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import httpx
import base64
import json

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, GoogleCallbackRequest
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.config import settings

router = APIRouter()


# ── Email / Password ──────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        auth_provider="email",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
def google_login_url():
    """Return the Google OAuth authorization URL for the frontend to redirect to."""
    base = "https://accounts.google.com/o/oauth2/v2/auth"
    params = (
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
    )
    return {"url": base + params}


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(payload: GoogleCallbackRequest, db: Session = Depends(get_db)):
    """
    Exchange the Google authorization code for tokens, fetch the user profile,
    and either sign in or register the user.
    """
    # 1. Exchange code for Google tokens
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": payload.code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
    except httpx.ConnectTimeout:
        raise HTTPException(status_code=503, detail="Could not reach Google — check your internet connection")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Network error: {str(e)}")

    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange Google code")

    google_tokens = token_resp.json()
    id_token = google_tokens.get("id_token")

    # 2. Decode the ID token to get user info
    parts = id_token.split(".")
    padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
    user_info = json.loads(base64.urlsafe_b64decode(padded))

    google_id  = user_info["sub"]
    email      = user_info.get("email", "")
    full_name  = user_info.get("name", "")
    avatar_url = user_info.get("picture", "")

    # 3. Upsert user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        user.google_id     = google_id
        user.avatar_url    = avatar_url or user.avatar_url
        user.auth_provider = "google"
    else:
        user = User(
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            google_id=google_id,
            auth_provider="google",
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


# ── Utility ───────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user