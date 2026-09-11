import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_score_success(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/analytics/score", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall" in data
    assert "simulation_success_rate" in data
    assert "detection_accuracy" in data


@pytest.mark.asyncio
async def test_get_score_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/analytics/score")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_stats_success(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/analytics/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_simulations" in data
    assert "total_analyses" in data


@pytest.mark.asyncio
async def test_get_stats_empty(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/analytics/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_simulations"] == 0
    assert data["total_analyses"] == 0


@pytest.mark.asyncio
async def test_get_vulnerabilities_success(client: AsyncClient, auth_headers):
    response = await client.get(
        "/api/v1/analytics/vulnerabilities", headers=auth_headers
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_vulnerabilities_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/analytics/vulnerabilities")
    assert response.status_code == 401
