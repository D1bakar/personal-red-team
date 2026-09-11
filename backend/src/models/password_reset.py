import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, String, DateTime, Boolean
from src.core.database import Base


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    @staticmethod
    def create_token(user_id: str, expire_minutes: int = 30) -> "PasswordReset":
        return PasswordReset(
            user_id=user_id,
            token=uuid.uuid4().hex,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=expire_minutes),
        )

    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at

    def is_valid(self) -> bool:
        return not self.used and not self.is_expired()
