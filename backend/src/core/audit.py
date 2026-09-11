from sqlalchemy.ext.asyncio import AsyncSession
from src.models.threat import SecurityEvent


async def log_security_event(
    db: AsyncSession,
    user_id: str,
    event_type: str,
    outcome: str,
    simulation_id: str | None = None,
    threat_type: str | None = None,
) -> None:
    event = SecurityEvent(
        user_id=user_id,
        event_type=event_type,
        simulation_id=simulation_id,
        threat_type=threat_type or "auth",
        outcome=outcome,
    )
    db.add(event)
    await db.flush()
