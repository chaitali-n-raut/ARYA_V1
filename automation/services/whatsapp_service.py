"""Local WhatsApp Web automation. Demo mode is safe and enabled by default."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

PHONE_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")
MAX_MESSAGE_LENGTH = 4096


@dataclass(frozen=True)
class AutomationResult:
    status: str
    detail: str


def validate_phone(phone: str) -> str:
    """Validate international E.164 format; never load contacts from ARYA data."""
    normalized = phone.strip()
    if not PHONE_PATTERN.fullmatch(normalized):
        raise ValueError("Phone number must use international E.164 format, e.g. +14155552671.")
    return normalized


def validate_message(message: str) -> str:
    cleaned = message.strip()
    if not cleaned:
        raise ValueError("Message must not be empty.")
    if len(cleaned) > MAX_MESSAGE_LENGTH:
        raise ValueError(f"Message must be {MAX_MESSAGE_LENGTH} characters or fewer.")
    return cleaned


def build_placement_reminder(company: str, role: str, date: str, time: str) -> str:
    """Construct a reminder only from explicitly supplied drive details."""
    values = {
        "Company": company.strip(),
        "Role": role.strip(),
        "Date": date.strip(),
        "Time": time.strip(),
    }
    missing = [label for label, value in values.items() if not value]
    if missing:
        raise ValueError(f"Placement reminder requires: {', '.join(missing)}.")
    return validate_message(
        "Placement drive reminder:\n"
        f"Company: {values['Company']}\n"
        f"Role: {values['Role']}\n"
        f"Date: {values['Date']}\n"
        f"Time: {values['Time']}"
    )


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    return f"+{digits[:2]}{'*' * max(4, len(digits) - 4)}{digits[-2:]}"


def demo_mode_enabled() -> bool:
    return os.getenv("ARYA_AUTOMATION_DEMO", "true").strip().lower() not in {"0", "false", "no"}


def send_whatsapp_message(phone: str, message: str, *, demo: bool | None = None) -> AutomationResult:
    """Open WhatsApp Web to send a message, or report the intended action in demo mode.

    A live return means the local PyWhatKit call completed; it does not prove delivery.
    """
    phone = validate_phone(phone)
    message = validate_message(message)
    use_demo = demo_mode_enabled() if demo is None else demo
    if use_demo:
        print(f"[DEMO] WhatsApp message prepared\nRecipient: {mask_phone(phone)}\nMessage: {message}")
        return AutomationResult("demo", "No browser was opened and no message was sent.")

    try:
        import pywhatkit
    except ImportError as exc:
        raise RuntimeError("PyWhatKit is not installed. Install automation/requirements.txt first.") from exc

    pywhatkit.sendwhatmsg_instantly(phone, message, wait_time=20, tab_close=True, close_time=3)
    return AutomationResult("browser_automation_requested", "WhatsApp Web automation ran; delivery was not independently confirmed.")


def schedule_whatsapp_message(
    phone: str,
    message: str,
    hour: int,
    minute: int,
    *,
    demo: bool | None = None,
) -> AutomationResult:
    """Ask PyWhatKit to schedule WhatsApp Web automation at local machine time."""
    phone = validate_phone(phone)
    message = validate_message(message)
    if isinstance(hour, bool) or not isinstance(hour, int) or not 0 <= hour <= 23:
        raise ValueError("Hour must be an integer from 0 through 23.")
    if isinstance(minute, bool) or not isinstance(minute, int) or not 0 <= minute <= 59:
        raise ValueError("Minute must be an integer from 0 through 59.")
    use_demo = demo_mode_enabled() if demo is None else demo
    if use_demo:
        print(f"[DEMO] WhatsApp reminder schedule preview\nRecipient: {mask_phone(phone)}\nMessage: {message}\nTime: {hour:02d}:{minute:02d} local time")
        return AutomationResult("demo", "No browser was opened and no message was scheduled.")

    try:
        import pywhatkit
    except ImportError as exc:
        raise RuntimeError("PyWhatKit is not installed. Install automation/requirements.txt first.") from exc

    pywhatkit.sendwhatmsg(phone, message, hour, minute, wait_time=20, tab_close=True, close_time=3)
    return AutomationResult("browser_automation_requested", "PyWhatKit scheduled local WhatsApp Web automation; delivery was not independently confirmed.")
