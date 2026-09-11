import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "new@example.com",
            "name": "New User",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_weak_password_no_uppercase(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "weak@example.com",
            "name": "Weak User",
            "password": "weakpass123!",
        },
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_register_weak_password_no_digit(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "weak@example.com",
            "name": "Weak User",
            "password": "WeakPass!",
        },
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_register_weak_password_no_special(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "weak@example.com",
            "name": "Weak User",
            "password": "WeakPass123",
        },
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "name": "First User",
            "password": "StrongPass123!",
        },
    )
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "name": "Another User",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_name_validation(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@example.com",
            "name": "123 Invalid!",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "TestPass123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "WrongPass123!"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@example.com", "password": "SomePass123!"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_password_too_long(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "longpass@example.com",
            "name": "Long Pass User",
            "password": "StrongPass123!",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "longpass@example.com", "password": "A" * 129 + "1!"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_success(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_refresh_token_rejected(client: AsyncClient, test_user):
    from src.core.security import create_refresh_token

    refresh_token = create_refresh_token(data={"sub": str(test_user.id)})
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_success(client: AsyncClient, test_user):
    from src.core.security import create_refresh_token

    refresh_token = create_refresh_token(data={"sub": str(test_user.id)})
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalidtoken"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_wrong_token_type(client: AsyncClient, test_user):
    from src.core.security import create_access_token

    access_token = create_access_token(data={"sub": str(test_user.id)})
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token},
    )
    assert response.status_code == 401
