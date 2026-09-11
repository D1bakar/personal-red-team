import resend
from src.core.config import get_settings

settings = get_settings()

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


async def send_verification_email(email: str, token: str) -> bool:
    if not settings.RESEND_API_KEY:
        print(f"[DEV] Verification link: {settings.FRONTEND_URL}/verify-email?token={token}")
        return True

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    params = {
        "from": settings.EMAIL_FROM,
        "to": [email],
        "subject": "Verify Your Email - Personal Red Team",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Verify Your Email</h2>
            <p>Thanks for registering with Personal Red Team. Please verify your email address by clicking the button below.</p>
            <a href="{verify_url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 16px 0;">VERIFY EMAIL</a>
            <p style="color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
        """,
    }

    try:
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False


async def send_password_reset_email(email: str, token: str) -> bool:
    if not settings.RESEND_API_KEY:
        print(f"[DEV] Password reset link: {settings.FRONTEND_URL}/reset-password?token={token}")
        return True

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    params = {
        "from": settings.EMAIL_FROM,
        "to": [email],
        "subject": "Reset Your Password - Personal Red Team",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to choose a new password.</p>
            <a href="{reset_url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 16px 0;">RESET PASSWORD</a>
            <p style="color: #666; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 12px;">This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
        </div>
        """,
    }

    try:
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False
