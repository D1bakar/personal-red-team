import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from src.core.database import Base
import enum


class SimulationType(str, enum.Enum):
    PHISHING_EMAIL = "phishing_email"
    SMISHING = "smishing"
    AUTHORITY_SCAM = "authority_scam"
    URGENCY_FEAR = "urgency_fear"
    CURIOSITY_BAIT = "curiosity_bait"
    GREED_PRIZE = "greed_prize"
    SECRECY_REQUEST = "secrecy_request"
    TECH_SUPPORT = "tech_support"
    ROMANCE_SOCIAL = "romance_social"


class SimulationStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INTERACTED = "interacted"
    IGNORED = "ignored"


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    type = Column(Enum(SimulationType), nullable=False)
    scenario_name = Column(String, nullable=False)
    psychological_triggers = Column(ARRAY(String), default=[])
    status = Column(Enum(SimulationStatus), default=SimulationStatus.PENDING)
    content = Column(Text, nullable=False)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    interacted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SimulationConfig(Base):
    __tablename__ = "simulation_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    frequency_hours = Column(Integer, default=24)
    enabled_types = Column(ARRAY(String), default=[t.value for t in SimulationType])
    difficulty_level = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
