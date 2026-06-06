from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str = "sqlite:///./meeting_minutes.db"

    # JWT & Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:5173/auth/callback"

    # Whisper (Speech-to-Text)
    WHISPER_MODE: str = "local"  # "local" or "api"
    OPENAI_API_KEY: Optional[str] = None
    WHISPER_LOCAL_MODEL: str = "base"  # "tiny", "base", "small", "medium"

    # Ollama (Local LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # File Storage
    AUDIO_STORAGE_PATH: str = "./storage/audio"
    PDF_STORAGE_PATH: str = "./storage/pdf"
    MAX_AUDIO_SIZE_MB: int = 200

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
