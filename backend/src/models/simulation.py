import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, Text, Boolean, Integer, JSON
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

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    scenario_name = Column(String, nullable=False)
    psychological_triggers = Column(JSON, default=[])
    status = Column(String, default=SimulationStatus.PENDING.value)
    content = Column(Text, nullable=False)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    interacted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SimulationConfig(Base):
    __tablename__ = "simulation_configs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, nullable=False, index=True)
    frequency_hours = Column(Integer, default=24)
    enabled_types = Column(JSON, default=[t.value for t in SimulationType])
    difficulty_level = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
