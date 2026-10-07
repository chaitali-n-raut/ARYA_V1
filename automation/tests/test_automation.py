from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone
from io import StringIO
import unittest

from automation.services.scheduler_service import parse_send_at, schedule_reminder
from automation.services.video_service import open_youtube_video, validate_youtube_url
from automation.services.whatsapp_service import (
    build_placement_reminder,
    schedule_whatsapp_message,
    send_whatsapp_message,
    validate_message,
    validate_phone,
)


class AutomationServiceTests(unittest.TestCase):
    def test_placement_message_construction_uses_supplied_values(self) -> None:
        message = build_placement_reminder("Example Systems", "Software Developer", "15 Oct 2026", "10:00 AM")
        self.assertEqual(
            message,
            "Placement drive reminder:\nCompany: Example Systems\nRole: Software Developer\nDate: 15 Oct 2026\nTime: 10:00 AM",
        )

    def test_invalid_phone_rejected(self) -> None:
        for phone in ("12345", "+0123456789", "+123abc45678"):
            with self.subTest(phone=phone), self.assertRaises(ValueError):
                validate_phone(phone)

    def test_empty_or_oversized_message_rejected(self) -> None:
        with self.assertRaises(ValueError):
            validate_message("  ")
        with self.assertRaises(ValueError):
            validate_message("x" * 4097)

    def test_schedule_time_ranges_validated(self) -> None:
        with self.assertRaises(ValueError):
            schedule_whatsapp_message("+14155552671", "Reminder", 24, 0, demo=True)
        with self.assertRaises(ValueError):
            schedule_whatsapp_message("+14155552671", "Reminder", 12, 60, demo=True)

    def test_timezone_and_future_time_required(self) -> None:
        now = datetime(2026, 10, 1, 12, 0, tzinfo=timezone.utc)
        self.assertEqual(parse_send_at("2026-10-01T12:05:00Z", now=now).minute, 5)
        with self.assertRaises(ValueError):
            parse_send_at("2026-10-01T12:05:00", now=now)
        with self.assertRaises(ValueError):
            parse_send_at("2026-10-01T12:01:00Z", now=now)

    def test_demo_message_does_not_launch_whatsapp(self) -> None:
        output = StringIO()
        with redirect_stdout(output):
            result = send_whatsapp_message("+14155552671", "Test reminder", demo=True)
        self.assertEqual(result.status, "demo")
        self.assertIn("[DEMO] WhatsApp message prepared", output.getvalue())
        self.assertNotIn("14155552671", output.getvalue())

    def test_demo_schedule_and_scheduler_adapter_do_not_launch_browser(self) -> None:
        output = StringIO()
        with redirect_stdout(output):
            result = schedule_whatsapp_message("+14155552671", "Reminder", 10, 30, demo=True)
        self.assertEqual(result.status, "demo")
        self.assertIn("Time: 10:30", output.getvalue())

        send_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
        with redirect_stdout(StringIO()):
            scheduled = schedule_reminder("+14155552671", "Reminder", send_at, demo=True)
        self.assertEqual(scheduled.status, "demo")

    def test_youtube_url_validation(self) -> None:
        valid = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        self.assertEqual(validate_youtube_url(valid), valid)
        for invalid in (
            "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
            "https://example.com/watch?v=dQw4w9WgXcQ",
            "https://youtu.be/short",
        ):
            with self.subTest(url=invalid), self.assertRaises(ValueError):
                validate_youtube_url(invalid)

    def test_youtube_demo_does_not_open_browser(self) -> None:
        with redirect_stdout(StringIO()):
            self.assertEqual(open_youtube_video("https://youtu.be/dQw4w9WgXcQ"), "demo")


if __name__ == "__main__":
    unittest.main()
