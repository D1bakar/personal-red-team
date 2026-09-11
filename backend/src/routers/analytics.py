from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.core.database import get_db
from src.core.security import get_current_user, limiter
from src.core.config import get_settings
from src.models.user import User
from src.models.simulation import Simulation
from src.models.threat import ThreatAnalysis
from src.services.scoring import ScoringService

settings = get_settings()
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/score")
@limiter.limit(settings.RATE_LIMIT_API)
async def get_score(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scoring = ScoringService()
    score = await scoring.calculate_score(db, current_user.id)
    return {
        "overall": score["overall"],
        "simulation_success_rate": score["simulation_success_rate"],
        "detection_accuracy": score["detection_accuracy"],
        "learning_completion": score["learning_completion"],
        "recency": score["recency"],
    }


@router.get("/stats")
@limiter.limit(settings.RATE_LIMIT_API)
async def get_stats(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sim_result = await db.execute(
        select(func.count(Simulation.id)).where(Simulation.user_id == current_user.id)
    )
    total_sims = sim_result.scalar() or 0

    analysis_result = await db.execute(
        select(func.count(ThreatAnalysis.id)).where(ThreatAnalysis.user_id == current_user.id)
    )
    total_analyses = analysis_result.scalar() or 0

    return {
        "total_simulations": total_sims,
        "total_analyses": total_analyses,
        "total_revealed": total_sims,
        "detection_rate": 100.0 if total_sims > 0 else 0,
    }


@router.get("/vulnerabilities")
@limiter.limit(settings.RATE_LIMIT_API)
async def get_vulnerabilities(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scoring = ScoringService()
    vulns = await scoring.get_vulnerability_profile(db, current_user.id)
    return dict(vulns)
