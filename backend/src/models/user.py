import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Boolean
from src.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    security_score = Column(Float, default=0.0)

    # Email verification
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True, index=True)

    # 2FA (TOTP)
    mfa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
