import asyncio
from src.core.database import engine, Base
from src.models import User, Simulation, SimulationConfig, ThreatAnalysis, SecurityEvent
from src.models.password_reset import PasswordReset


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")


if __name__ == "__main__":
    asyncio.run(init_db())
