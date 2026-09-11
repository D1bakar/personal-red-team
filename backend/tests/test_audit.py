import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.threat import SecurityEvent


@pytest.mark.asyncio
async def test_audit_event_created_on_register(client: AsyncClient, db_session: AsyncSession):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "audit@example.com",
            "name": "Audit User",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 201

    result = await db_session.execute(
        select(SecurityEvent).where(SecurityEvent.event_type == "register")
    )
    events = result.scalars().all()
    assert len(events) >= 1
    assert events[0].outcome == "success"


@pytest.mark.asyncio
async def test_audit_event_created_on_login(
    client: AsyncClient, test_user, db_session: AsyncSession
):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "TestPass123!"},
    )
    assert response.status_code == 200

    result = await db_session.execute(
        select(SecurityEvent).where(SecurityEvent.event_type == "login_success")
    )
    events = result.scalars().all()
    assert len(events) >= 1


@pytest.mark.asyncio
async def test_audit_event_created_on_failed_login(
    client: AsyncClient, test_user, db_session: AsyncSession
):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "WrongPass123!"},
    )
    assert response.status_code == 401

    result = await db_session.execute(
        select(SecurityEvent).where(SecurityEvent.event_type == "login_failed")
    )
    events = result.scalars().all()
    assert len(events) >= 1
    assert events[0].outcome == "failure"


@pytest.mark.asyncio
async def test_audit_history_returns_own_events(
    client: AsyncClient, auth_headers, db_session: AsyncSession, test_user
):
    event = SecurityEvent(
        user_id=test_user.id,
        event_type="login_success",
        threat_type="auth",
        outcome="success",
    )
    db_session.add(event)
    await db_session.commit()

    response = await client.get("/api/v1/audit/events", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_audit_history_empty(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/audit/events", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_audit_history_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/audit/events")
    assert response.status_code == 401
