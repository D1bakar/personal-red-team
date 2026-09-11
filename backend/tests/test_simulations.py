import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_generate_simulation_success(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/v1/simulations/generate",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "type" in data
    assert "content" in data


@pytest.mark.asyncio
async def test_generate_simulation_unauthenticated(client: AsyncClient):
    response = await client.post("/api/v1/simulations/generate")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_simulations_success(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/simulations", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_list_simulations_empty(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/simulations", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 0


@pytest.mark.asyncio
async def test_get_simulation_not_found(client: AsyncClient, auth_headers):
    response = await client.get(
        "/api/v1/simulations/nonexistent-id",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_reveal_simulation_not_found(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/v1/simulations/nonexistent-id/reveal",
        headers=auth_headers,
    )
    assert response.status_code == 404
