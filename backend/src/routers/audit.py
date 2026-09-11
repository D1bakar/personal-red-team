from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import get_current_user, limiter
from src.core.config import get_settings
from src.models.user import User
from src.models.threat import SecurityEvent

settings = get_settings()
router = APIRouter(prefix="/audit", tags=["audit"])


class SecurityEventResponse(BaseModel):
    id: str
    event_type: str
    threat_type: str
    outcome: str
    timestamp: datetime

    class Config:
        from_attributes = True


@router.get("/events", response_model=list[SecurityEventResponse])
@limiter.limit(settings.RATE_LIMIT_API)
async def get_security_events(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    result = await db.execute(
        select(SecurityEvent)
        .where(SecurityEvent.user_id == current_user.id)
        .order_by(SecurityEvent.timestamp.desc())
        .limit(limit)
        .offset(offset)
    )
    events = result.scalars().all()
    return [SecurityEventResponse.model_validate(e) for e in events]
