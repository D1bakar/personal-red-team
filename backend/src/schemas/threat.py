from pydantic import BaseModel
from datetime import datetime


class ThreatAnalysisCreate(BaseModel):
    input_text: str


class ThreatAnalysisResponse(BaseModel):
    id: str
    input_text: str
    threat_level: str
    threat_score: float
    triggers: list[str]
    flagged_phrases: list[str]
    recommendations: list[str]
    explanation: str
    analyzed_at: datetime

    class Config:
        from_attributes = True
