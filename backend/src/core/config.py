from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Red Team API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite+aiosqlite:///./personal_red_team.db"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    DEBUG: bool = True

    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_API: str = "60/minute"

    MAX_PASSWORD_LENGTH: int = 128
    MIN_PASSWORD_LENGTH: int = 8

    # Email (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@personalredteam.com"
    FRONTEND_URL: str = "http://localhost:3000"

    # Password Reset
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30

    # 2FA (TOTP)
    TOTP_ISSUER: str = "Personal Red Team"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
