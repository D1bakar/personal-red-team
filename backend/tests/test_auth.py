import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.user import User
from src.models.password_reset import PasswordReset


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
    # Dev mode (no RESEND_API_KEY) auto-verifies new users.
    assert data["user"]["is_verified"] is True


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
async def test_login_unverified_user(client: AsyncClient, db_session: AsyncSession):
    user = User(
        email="unverified@example.com",
        name="Unverified User",
        hashed_password="dummy_hash",
        is_verified=False,
    )
    db_session.add(user)
    await db_session.commit()

    from src.core.security import get_password_hash
    user.hashed_password = get_password_hash("TestPass123!")
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "unverified@example.com", "password": "TestPass123!"},
    )
    assert response.status_code == 403
    assert "not verified" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_verify_email(client: AsyncClient, db_session: AsyncSession):
    user = User(
        email="verify@example.com",
        name="Verify User",
        hashed_password="dummy_hash",
        verification_token="test-token-123",
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/verify-email",
        json={"token": "test-token-123"},
    )
    assert response.status_code == 200

    result = await db_session.execute(select(User).where(User.email == "verify@example.com"))
    updated_user = result.scalar_one()
    assert updated_user.is_verified is True
    assert updated_user.verification_token is None


@pytest.mark.asyncio
async def test_verify_email_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/verify-email",
        json={"token": "invalid-token"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_forgot_password(client: AsyncClient, test_user):
    response = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_reset_password(client: AsyncClient, test_user, db_session: AsyncSession):
    reset = PasswordReset.create_token(test_user.id, 30)
    db_session.add(reset)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset.token, "password": "NewPass123!"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_reset_password_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid-token", "password": "NewPass123!"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_reset_password_weak_password(client: AsyncClient, test_user, db_session: AsyncSession):
    reset = PasswordReset.create_token(test_user.id, 30)
    db_session.add(reset)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset.token, "password": "nouppercase1!"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_2fa_setup(client: AsyncClient, auth_headers):
    response = await client.post("/api/v1/auth/2fa/setup", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    assert "qr_code" in data
    assert data["qr_code"].startswith("data:image/png;base64,")


@pytest.mark.asyncio
async def test_2fa_enable(client: AsyncClient, auth_headers):
    setup_response = await client.post("/api/v1/auth/2fa/setup", headers=auth_headers)
    secret = setup_response.json()["secret"]

    import pyotp
    totp = pyotp.TOTP(secret)
    code = totp.now()

    response = await client.post(
        "/api/v1/auth/2fa/enable",
        json={"token": "dummy", "code": code},
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_2fa_disable(client: AsyncClient, auth_headers, test_user, db_session: AsyncSession):
    import pyotp
    secret = pyotp.random_base32()
    test_user.totp_secret = secret
    test_user.mfa_enabled = True
    await db_session.commit()

    totp = pyotp.TOTP(secret)
    code = totp.now()

    response = await client.post(
        "/api/v1/auth/2fa/disable",
        json={"token": "dummy", "code": code},
        headers=auth_headers,
    )
    assert response.status_code == 200


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
