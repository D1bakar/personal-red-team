from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.threat import ThreatAnalysis
from src.schemas.threat import ThreatAnalysisCreate, ThreatAnalysisResponse
from src.services.threat_analyzer import ThreatAnalyzer

router = APIRouter(prefix="/threats", tags=["threats"])


@router.post("/analyze", response_model=ThreatAnalysisResponse)
async def analyze_threat(
    data: ThreatAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    analyzer = ThreatAnalyzer()
    analysis = await analyzer.analyze(db, current_user.id, data.input_text)
    return ThreatAnalysisResponse.model_validate(analysis)


@router.get("/history", response_model=list[ThreatAnalysisResponse])
async def get_threat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ThreatAnalysis)
        .where(ThreatAnalysis.user_id == current_user.id)
        .order_by(ThreatAnalysis.analyzed_at.desc())
        .limit(50)
    )
    return [ThreatAnalysisResponse.model_validate(a) for a in result.scalars().all()]
