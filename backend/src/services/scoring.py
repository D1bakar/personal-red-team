from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.models.simulation import Simulation, SimulationStatus, SimulationType
from src.models.threat import ThreatAnalysis, ThreatLevel


class ScoringService:
    async def calculate_score(self, db: AsyncSession, user_id: UUID) -> dict:
        total_sims = await db.execute(
            select(func.count()).select_from(Simulation).where(Simulation.user_id == user_id)
        )
        total_sims_count = total_sims.scalar() or 0

        ignored_sims = await db.execute(
            select(func.count()).select_from(Simulation).where(
                Simulation.user_id == user_id,
                Simulation.status == SimulationStatus.IGNORED,
            )
        )
        ignored_count = ignored_sims.scalar() or 0

        total_analyses = await db.execute(
            select(func.count()).select_from(ThreatAnalysis).where(ThreatAnalysis.user_id == user_id)
        )
        total_analyses_count = total_analyses.scalar() or 0

        danger_caught = await db.execute(
            select(func.count()).select_from(ThreatAnalysis).where(
                ThreatAnalysis.user_id == user_id,
                ThreatAnalysis.threat_level.in_([ThreatLevel.DANGER, ThreatLevel.CAUTION]),
            )
        )
        danger_caught_count = danger_caught.scalar() or 0

        if total_sims_count > 0:
            simulation_success = (ignored_count / total_sims_count) * 100
        else:
            simulation_success = 50.0

        if total_analyses_count > 0:
            detection_accuracy = (danger_caught_count / total_analyses_count) * 100
        else:
            detection_accuracy = 50.0

        learning_completion = min(total_sims_count * 5, 100)
        recency = 75.0

        overall = (
            simulation_success * 0.4
            + detection_accuracy * 0.3
            + learning_completion * 0.2
            + recency * 0.1
        )

        return {
            "overall": round(overall, 1),
            "simulation_success_rate": round(simulation_success, 1),
            "detection_accuracy": round(detection_accuracy, 1),
            "learning_completion": round(learning_completion, 1),
            "recency": round(recency, 1),
        }

    async def get_vulnerability_profile(self, db: AsyncSession, user_id: UUID) -> dict:
        profile = {}
        for trigger in ["urgency", "fear", "authority", "greed", "curiosity", "secrecy"]:
            sims_with_trigger = await db.execute(
                select(func.count()).select_from(Simulation).where(
                    Simulation.user_id == user_id,
                    Simulation.psychological_triggers.any(trigger),
                )
            )
            interacted_with_trigger = await db.execute(
                select(func.count()).select_from(Simulation).where(
                    Simulation.user_id == user_id,
                    Simulation.psychological_triggers.any(trigger),
                    Simulation.status == SimulationStatus.INTERACTED,
                )
            )

            total = sims_with_trigger.scalar() or 0
            interacted = interacted_with_trigger.scalar() or 0

            if total > 0:
                vulnerability = interacted / total
            else:
                vulnerability = 0.5

            profile[trigger] = round(vulnerability, 2)

        return profile
