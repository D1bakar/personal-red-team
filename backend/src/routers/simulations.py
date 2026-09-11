from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import get_current_user, limiter
from src.core.config import get_settings
from src.models.user import User
from src.models.simulation import Simulation
from src.schemas.simulation import SimulationResponse, SimulationReveal
from src.services.simulation_engine import SimulationEngine

settings = get_settings()
router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("/generate", response_model=SimulationResponse)
@limiter.limit(settings.RATE_LIMIT_API)
async def generate_simulation(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = SimulationEngine()
    simulation = await engine.create_simulation(db, current_user.id)
    await db.flush()
    await db.refresh(simulation)
    return SimulationResponse(
        id=simulation.id,
        user_id=simulation.user_id,
        type=simulation.type,
        scenario_name=simulation.scenario_name,
        psychological_triggers=simulation.psychological_triggers or [],
        status=simulation.status,
        content=simulation.content,
        delivered_at=simulation.delivered_at,
        interacted_at=simulation.interacted_at,
        created_at=simulation.created_at,
    )


@router.get("", response_model=list[SimulationResponse])
@limiter.limit(settings.RATE_LIMIT_API)
async def list_simulations(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
        .limit(50)
    )
    sims = result.scalars().all()
    return [
        SimulationResponse(
            id=s.id,
            user_id=s.user_id,
            type=s.type,
            scenario_name=s.scenario_name,
            psychological_triggers=s.psychological_triggers or [],
            status=s.status,
            content=s.content,
            delivered_at=s.delivered_at,
            interacted_at=s.interacted_at,
            created_at=s.created_at,
        )
        for s in sims
    ]


@router.get("/{simulation_id}", response_model=SimulationResponse)
@limiter.limit(settings.RATE_LIMIT_API)
async def get_simulation(
    request: Request,
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not simulation_id or not simulation_id.strip():
        raise HTTPException(status_code=400, detail="Invalid simulation ID")
    result = await db.execute(
        select(Simulation).where(
            Simulation.id == simulation_id,
            Simulation.user_id == current_user.id,
        )
    )
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return SimulationResponse(
        id=simulation.id,
        user_id=simulation.user_id,
        type=simulation.type,
        scenario_name=simulation.scenario_name,
        psychological_triggers=simulation.psychological_triggers or [],
        status=simulation.status,
        content=simulation.content,
        delivered_at=simulation.delivered_at,
        interacted_at=simulation.interacted_at,
        created_at=simulation.created_at,
    )


@router.post("/{simulation_id}/reveal", response_model=SimulationReveal)
@limiter.limit(settings.RATE_LIMIT_API)
async def reveal_simulation(
    request: Request,
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not simulation_id or not simulation_id.strip():
        raise HTTPException(status_code=400, detail="Invalid simulation ID")
    result = await db.execute(
        select(Simulation).where(
            Simulation.id == simulation_id,
            Simulation.user_id == current_user.id,
        )
    )
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    engine = SimulationEngine()
    reveal = engine.get_reveal(simulation)
    return SimulationReveal(
        simulation_id=simulation.id,
        psychological_triggers=reveal.psychological_triggers,
        explanation=reveal.explanation,
        defense_tips=reveal.defense_tips,
        difficulty_rating=reveal.difficulty_rating,
    )
