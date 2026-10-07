"""Validation and local scheduling adapter for future reminder API requests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from .whatsapp_service import AutomationResult, schedule_whatsapp_message


def parse_send_at(send_at: str, *, now: datetime | None = None) -> datetime:
    """Parse an ISO-8601 timestamp with an explicit timezone and require lead time."""
    try:
        requested = datetime.fromisoformat(send_at.replace("Z", "+00:00"))
    except (TypeError, ValueError) as exc:
        raise ValueError("send_at must be a valid ISO-8601 datetime with a timezone.") from exc
    if requested.tzinfo is None or requested.utcoffset() is None:
        raise ValueError("send_at must include a timezone offset, such as +05:30 or Z.")

    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None or current.utcoffset() is None:
        raise ValueError("Reference time must include a timezone.")
    if requested.astimezone(timezone.utc) <= current.astimezone(timezone.utc) + timedelta(minutes=2):
        raise ValueError("send_at must be at least 2 minutes in the future for browser automation.")
    if requested.astimezone(timezone.utc) > current.astimezone(timezone.utc) + timedelta(hours=24):
        raise ValueError("PyWhatKit local scheduling supports this adapter only within the next 24 hours.")
    return requested


def schedule_reminder(phone: str, message: str, send_at: str, *, demo: bool | None = None) -> AutomationResult:
    requested = parse_send_at(send_at)
    local_time = requested.astimezone()
    return schedule_whatsapp_message(phone, message, local_time.hour, local_time.minute, demo=demo)
