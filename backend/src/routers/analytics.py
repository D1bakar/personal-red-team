from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.simulation import Simulation, SimulationStatus
from src.models.threat import ThreatAnalysis, ThreatLevel
from src.services.scoring import ScoringService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/score")
async def get_security_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scoring = ScoringService()
    score = await scoring.calculate_score(db, current_user.id)
    return score


@router.get("/vulnerabilities")
async def get_vulnerabilities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scoring = ScoringService()
    return await scoring.get_vulnerability_profile(db, current_user.id)


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_sims = await db.execute(
        select(func.count()).select_from(Simulation).where(Simulation.user_id == current_user.id)
    )
    interacted = await db.execute(
        select(func.count()).select_from(Simulation).where(
            Simulation.user_id == current_user.id,
            Simulation.status == SimulationStatus.INTERACTED,
        )
    )
    total_analyses = await db.execute(
        select(func.count()).select_from(ThreatAnalysis).where(ThreatAnalysis.user_id == current_user.id)
    )
    danger_detected = await db.execute(
        select(func.count()).select_from(ThreatAnalysis).where(
            ThreatAnalysis.user_id == current_user.id,
            ThreatAnalysis.threat_level == ThreatLevel.DANGER,
        )
    )

    return {
        "total_simulations": total_sims.scalar() or 0,
        "interacted_simulations": interacted.scalar() or 0,
        "total_analyses": total_analyses.scalar() or 0,
        "threats_detected": danger_detected.scalar() or 0,
    }
