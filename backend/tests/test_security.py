import pytest
from src.core.security import (
    validate_password_strength,
    sanitize_input,
    sanitize_email,
)


def test_password_strength_strong():
    is_valid, msg = validate_password_strength("StrongPass123!")
    assert is_valid is True
    assert msg == ""


def test_password_strength_no_uppercase():
    is_valid, msg = validate_password_strength("weakpass123!")
    assert is_valid is False
    assert "uppercase" in msg.lower()


def test_password_strength_no_lowercase():
    is_valid, msg = validate_password_strength("WEAKPASS123!")
    assert is_valid is False
    assert "lowercase" in msg.lower()


def test_password_strength_no_digit():
    is_valid, msg = validate_password_strength("WeakPass!")
    assert is_valid is False
    assert "digit" in msg.lower()


def test_password_strength_no_special():
    is_valid, msg = validate_password_strength("WeakPass123")
    assert is_valid is False
    assert "special" in msg.lower()


def test_password_strength_too_short():
    is_valid, msg = validate_password_strength("Ab1!")
    assert is_valid is False
    assert "8 characters" in msg


def test_password_strength_too_long():
    is_valid, msg = validate_password_strength("A" * 129 + "1!")
    assert is_valid is False
    assert "128 characters" in msg


def test_sanitize_input_html_stripped():
    result = sanitize_input("<script>alert('xss')</script>Hello")
    assert "<script>" not in result
    assert "script" not in result.lower()
    assert "Hello" in result


def test_sanitize_input_max_length():
    long_input = "A" * 15000
    result = sanitize_input(long_input)
    assert len(result) <= 10000


def test_sanitize_email_lowercase():
    result = sanitize_email("TEST@EXAMPLE.COM")
    assert result == "test@example.com"


def test_sanitize_email_strips_whitespace():
    result = sanitize_email("  test@example.com  ")
    assert result == "test@example.com"
