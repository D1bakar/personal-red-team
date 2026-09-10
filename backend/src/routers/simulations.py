from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.simulation import Simulation, SimulationStatus
from src.schemas.simulation import SimulationResponse, SimulationReveal
from src.services.simulation_engine import SimulationEngine

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.get("", response_model=list[SimulationResponse])
async def list_simulations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
    )
    return [SimulationResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/generate", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def generate_simulation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = SimulationEngine()
    simulation = await engine.create_simulation(db, current_user.id)
    return SimulationResponse.model_validate(simulation)


@router.post("/{simulation_id}/interact", response_model=SimulationResponse)
async def record_interaction(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Simulation).where(
            Simulation.id == simulation_id,
            Simulation.user_id == current_user.id,
        )
    )
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    simulation.status = SimulationStatus.INTERACTED.value
    simulation.interacted_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(simulation)
    return SimulationResponse.model_validate(simulation)


@router.post("/{simulation_id}/reveal", response_model=SimulationReveal)
async def reveal_simulation(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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
    return engine.get_reveal(simulation)
