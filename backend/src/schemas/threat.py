from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from src.models.threat import ThreatLevel


class ThreatAnalysisCreate(BaseModel):
    input_text: str


class ThreatAnalysisResponse(BaseModel):
    id: UUID
    input_text: str
    threat_level: ThreatLevel
    threat_score: float
    triggers: list[str]
    explanation: str
    analyzed_at: datetime

    class Config:
        from_attributes = True
