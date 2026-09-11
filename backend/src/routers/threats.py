from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import get_current_user, sanitize_input, limiter
from src.core.config import get_settings
from src.models.user import User
from src.models.threat import ThreatAnalysis
from src.schemas.threat import ThreatAnalysisCreate, ThreatAnalysisResponse
from src.services.threat_analyzer import ThreatAnalyzer

settings = get_settings()
router = APIRouter(prefix="/threats", tags=["threats"])


@router.post("/analyze", response_model=ThreatAnalysisResponse)
@limiter.limit(settings.RATE_LIMIT_API)
async def analyze_threat(
    request: Request,
    data: ThreatAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sanitized_text = sanitize_input(data.input_text)
    analyzer = ThreatAnalyzer()
    analysis = analyzer.analyze(db, current_user.id, sanitized_text)
    await db.flush()
    await db.refresh(analysis)
    return ThreatAnalysisResponse.model_validate(analysis)


@router.get("/history", response_model=list[ThreatAnalysisResponse])
@limiter.limit(settings.RATE_LIMIT_API)
async def get_threat_history(
    request: Request,
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
