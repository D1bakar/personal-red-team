import secrets
import io
import pyotp
import qrcode
import base64
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    validate_password_strength,
    sanitize_email,
    limiter,
)
from src.core.audit import log_security_event
from src.core.config import get_settings
from src.core.lockout import lockout_manager
from src.core.email import send_verification_email, send_password_reset_email
from src.models.user import User
from src.models.password_reset import PasswordReset
from src.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    RefreshTokenRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
)

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    email = sanitize_email(user_data.email)

    is_valid, msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    verification_token = secrets.token_urlsafe(32)

    user = User(
        email=email,
        name=user_data.name.strip()[:100],
        hashed_password=get_password_hash(user_data.password),
        verification_token=verification_token,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    await send_verification_email(email, verification_token)

    if not settings.RESEND_API_KEY:
        user.is_verified = True

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    await log_security_event(db, user.id, "register", "success")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-email")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def verify_email(request: Request, body: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == body.token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )

    user.is_verified = True
    user.verification_token = None
    await db.flush()

    await log_security_event(db, user.id, "email_verified", "success")

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def resend_verification(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = sanitize_email(body.email)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user and not user.is_verified:
        verification_token = secrets.token_urlsafe(32)
        user.verification_token = verification_token
        await db.flush()
        await send_verification_email(email, verification_token)

    return {"message": "If your email is not verified, a verification link has been sent"}


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    email = sanitize_email(form_data.username)

    if lockout_manager.is_locked(email):
        remaining = lockout_manager.get_remaining_lockout_seconds(email)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {remaining} seconds.",
        )

    if len(form_data.password) > settings.MAX_PASSWORD_LENGTH:
        lockout_manager.record_failure(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        lockout_manager.record_failure(email)
        if user:
            await log_security_event(db, user.id, "login_failed", "failure")
        else:
            await log_security_event(db, email, "login_failed", "failure")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox.",
        )

    if user.mfa_enabled:
        temp_token = create_access_token(data={"sub": str(user.id), "type": "mfa_pending"})
        return Token(
            access_token=temp_token,
            refresh_token="",
            user=UserResponse.model_validate(user),
        )

    lockout_manager.clear_failures(email)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    await log_security_event(db, user.id, "login_success", "success")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-2fa", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def verify_2fa(
    request: Request,
    body: TwoFactorVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    payload = decode_token(body.token)
    if payload.get("type") != "mfa_pending":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.mfa_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not configured",
        )

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code",
        )

    lockout_manager.clear_failures(user.email)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    await log_security_event(db, user.id, "login_2fa_success", "success")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name=settings.TOTP_ISSUER,
    )

    qr = qrcode.make(provisioning_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    current_user.totp_secret = secret
    await db.flush()

    return TwoFactorSetupResponse(
        secret=secret,
        qr_code=f"data:image/png;base64,{qr_base64}",
        provisioning_uri=provisioning_uri,
    )


@router.post("/2fa/enable")
async def enable_2fa(
    body: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )

    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Run /2fa/setup first",
        )

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code",
        )

    current_user.mfa_enabled = True
    await db.flush()

    await log_security_event(db, current_user.id, "2fa_enabled", "success")

    return {"message": "2FA enabled successfully"}


@router.post("/2fa/disable")
async def disable_2fa(
    body: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )

    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not properly configured",
        )

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code",
        )

    current_user.mfa_enabled = False
    current_user.totp_secret = None
    await db.flush()

    await log_security_event(db, current_user.id, "2fa_disabled", "success")

    return {"message": "2FA disabled successfully"}


@router.post("/refresh", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def refresh_token(request: Request, body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)

    if payload.get("type") != "refresh":
        user_id = payload.get("sub")
        if user_id:
            await log_security_event(db, user_id, "token_refresh_failed", "failure")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        await log_security_event(db, user_id, "token_refresh_failed", "failure")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    await log_security_event(db, user.id, "token_refresh", "success")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/forgot-password")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = sanitize_email(body.email)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        reset = PasswordReset.create_token(user.id, settings.PASSWORD_RESET_EXPIRE_MINUTES)
        db.add(reset)
        await db.flush()
        await send_password_reset_email(email, reset.token)

    return {"message": "If your email exists, a reset link has been sent"}


@router.post("/reset-password")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def reset_password(request: Request, body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordReset).where(PasswordReset.token == body.token))
    reset = result.scalar_one_or_none()

    if not reset or not reset.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    is_valid, msg = validate_password_strength(body.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    user_result = await db.execute(select(User).where(User.id == reset.user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    user.hashed_password = get_password_hash(body.password)
    reset.used = True
    await db.flush()

    await log_security_event(db, user.id, "password_reset", "success")

    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
