import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, JSON
from src.core.database import Base
import enum


class ThreatLevel(str, enum.Enum):
    SAFE = "safe"
    CAUTION = "caution"
    DANGER = "danger"


class ThreatAnalysis(Base):
    __tablename__ = "threat_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    input_text = Column(Text, nullable=False)
    threat_level = Column(String, nullable=False)
    threat_score = Column(Float, nullable=False)
    triggers = Column(JSON, default=[])
    explanation = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    simulation_id = Column(String, nullable=True)
    threat_type = Column(String, nullable=False)
    outcome = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
