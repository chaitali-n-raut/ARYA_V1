"""Open an explicitly supplied YouTube watch URL after strict host/path validation."""

from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")
YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"}


def validate_youtube_url(url: str) -> str:
    candidate = url.strip()
    parsed = urlparse(candidate)
    if parsed.scheme != "https" or parsed.hostname not in YOUTUBE_HOSTS or parsed.username or parsed.password:
        raise ValueError("Only HTTPS YouTube video URLs are allowed.")

    video_id = ""
    if parsed.hostname in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/").split("/")[0] if parsed.path.strip("/") else ""
    elif parsed.path == "/watch":
        video_id = parse_qs(parsed.query).get("v", [""])[0]
    elif parsed.path.startswith("/shorts/") or parsed.path.startswith("/embed/"):
        parts = parsed.path.strip("/").split("/")
        video_id = parts[1] if len(parts) == 2 else ""

    if not VIDEO_ID_PATTERN.fullmatch(video_id):
        raise ValueError("Provide a valid YouTube watch, short, embed, or youtu.be video URL.")
    return candidate


def open_youtube_video(url: str, *, demo: bool = True) -> str:
    """Open a validated exact URL; no video is downloaded and demo is the default."""
    safe_url = validate_youtube_url(url)
    if demo:
        print(f"[DEMO] YouTube video validated; browser not opened: {safe_url}")
        return "demo"

    import webbrowser

    if not webbrowser.open(safe_url, new=2):
        raise RuntimeError("The system browser could not be opened.")
    return "browser_opened"
