import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from src.core.database import Base
import enum


class ThreatLevel(str, enum.Enum):
    SAFE = "safe"
    CAUTION = "caution"
    DANGER = "danger"


class ThreatAnalysis(Base):
    __tablename__ = "threat_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    input_text = Column(Text, nullable=False)
    threat_level = Column(Enum(ThreatLevel), nullable=False)
    threat_score = Column(Float, nullable=False)
    triggers = Column(ARRAY(String), default=[])
    explanation = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_type = Column(String, nullable=False)
    simulation_id = Column(UUID(as_uuid=True), nullable=True)
    threat_type = Column(String, nullable=False)
    outcome = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
