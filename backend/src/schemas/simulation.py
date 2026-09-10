from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from src.models.simulation import SimulationType, SimulationStatus


class SimulationCreate(BaseModel):
    type: SimulationType | None = None
    difficulty_level: int | None = None


class SimulationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: SimulationType
    scenario_name: str
    psychological_triggers: list[str]
    status: SimulationStatus
    content: str
    delivered_at: datetime | None
    interacted_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class SimulationConfigCreate(BaseModel):
    frequency_hours: int = 24
    enabled_types: list[SimulationType] = list(SimulationType)
    difficulty_level: int = 3
    is_active: bool = True


class SimulationReveal(BaseModel):
    simulation_id: UUID
    psychological_triggers: list[str]
    explanation: str
    defense_tips: list[str]
    difficulty_rating: int
