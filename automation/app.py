"""Local-only CLI for optional ARYA AI automation; deliberately starts no HTTP server."""

from __future__ import annotations

import argparse
from automation.services.scheduler_service import schedule_reminder
from automation.services.video_service import open_youtube_video
from automation.services.whatsapp_service import demo_mode_enabled, send_whatsapp_message


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Local ARYA AI automation (demo mode by default).")
    parser.add_argument("--live", action="store_true", help="Permit local browser automation; requires ARYA_AUTOMATION_DEMO=false.")
    commands = parser.add_subparsers(dest="command", required=True)

    send = commands.add_parser("whatsapp", help="Prepare/send one WhatsApp message.")
    send.add_argument("--phone", required=True)
    send.add_argument("--message", required=True)

    schedule = commands.add_parser("schedule", help="Prepare/schedule a WhatsApp reminder.")
    schedule.add_argument("--phone", required=True)
    schedule.add_argument("--message", required=True)
    schedule.add_argument("--send-at", required=True, help="Timezone-aware ISO-8601 datetime.")

    video = commands.add_parser("youtube", help="Validate/open an explicit YouTube URL.")
    video.add_argument("--url", required=True)
    return parser


def main() -> int:
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        pass

    args = build_parser().parse_args()
    demo = demo_mode_enabled()
    if args.live and demo:
        raise ValueError("Live mode requires ARYA_AUTOMATION_DEMO=false as well as --live.")
    if not args.live:
        demo = True

    if args.command == "whatsapp":
        result = send_whatsapp_message(args.phone, args.message, demo=demo)
    elif args.command == "schedule":
        result = schedule_reminder(args.phone, args.message, args.send_at, demo=demo)
    else:
        result = open_youtube_video(args.url, demo=demo)
        print(f"Result: {result}")
        return 0

    print(f"Result: {result.status} — {result.detail}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValueError as error:
        raise SystemExit(f"Invalid automation request: {error}") from error
