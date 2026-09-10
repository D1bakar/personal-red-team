from pydantic import BaseModel
from datetime import datetime


class SimulationCreate(BaseModel):
    type: str | None = None
    difficulty_level: int | None = None


class SimulationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    scenario_name: str
    psychological_triggers: list[str]
    status: str
    content: str
    delivered_at: datetime | None
    interacted_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class SimulationConfigCreate(BaseModel):
    frequency_hours: int = 24
    enabled_types: list[str] = []
    difficulty_level: int = 3
    is_active: bool = True


class SimulationReveal(BaseModel):
    simulation_id: str
    psychological_triggers: list[str]
    explanation: str
    defense_tips: list[str]
    difficulty_rating: int
