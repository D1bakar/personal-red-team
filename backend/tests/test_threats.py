import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analyze_threat_success(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/v1/threats/analyze",
        json={"input_text": "This is a test message"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "threat_level" in data
    assert "threat_score" in data


@pytest.mark.asyncio
async def test_analyze_threat_unauthenticated(client: AsyncClient):
    response = await client.post(
        "/api/v1/threats/analyze",
        json={"input_text": "This is a test message"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_analyze_threat_sanitize_input(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/v1/threats/analyze",
        json={"input_text": "<script>alert('xss')</script>Hello"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "input_text" in data


@pytest.mark.asyncio
async def test_threat_history_success(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/threats/history", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_threat_history_empty(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/threats/history", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 0


@pytest.mark.asyncio
async def test_threat_history_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/threats/history")
    assert response.status_code == 401
