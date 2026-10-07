# ARYA AI Local Automation Layer

This optional Python package is intentionally independent from the React + TypeScript + Vite frontend. It is a **local development automation service only**: it starts no HTTP server and reads no student roster, student phone number, placement application, authentication session, password, or localStorage data.

> PyWhatKit is used only as an optional automation layer for development/prototype notification tasks. It is not the authentication system and does not provide secure email verification.

Production deployment should replace browser/UI automation with a proper messaging provider/API and backend scheduler.

## Current capabilities

- `send_whatsapp_message(phone, message)` validates an explicit E.164 phone number and prepares a local WhatsApp Web action.
- `schedule_whatsapp_message(phone, message, hour, minute)` validates the requested local time and delegates to PyWhatKit's WhatsApp scheduling function in live mode.
- `schedule_reminder(phone, message, send_at)` is the local adapter for a future request shaped like `POST /automation/whatsapp/reminder` with `{ "phone": "...", "message": "...", "send_at": "..." }`. `send_at` must be timezone-aware ISO-8601, 2 minutes to 24 hours in the future. The adapter uses the local computer's timezone/browser. It is not an HTTP endpoint or durable server scheduler.
- `build_placement_reminder(company, role, date, time)` formats explicitly supplied drive information; no drives or recipients are fetched automatically.
- `open_youtube_video(url)` accepts only HTTPS YouTube watch, short, embed, or youtu.be URLs. It never downloads video. PyWhatKit's documented YouTube helper searches for a topic rather than opening an exact supplied URL, so this exact-URL helper uses Python's standard `webbrowser` module instead.

## Safe local setup

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
py -m pip install -r automation\requirements.txt
Copy-Item automation\.env.example automation\.env
```

Demo mode is on by default. It masks the phone number in output and never opens a browser. Try it with a made-up test number and non-sensitive message:

```powershell
py -m automation.app whatsapp --phone +14155552671 --message "Placement reminder demo"
py -m automation.app schedule --phone +14155552671 --message "Placement reminder demo" --send-at 2026-10-07T15:30:00+05:30
py -m automation.app youtube --url https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

For an intentional local browser action, set `ARYA_AUTOMATION_DEMO=false` in `automation/.env` **and** pass `--live` before the subcommand. This may open WhatsApp Web or a browser and interact with the local session. Review all recipient/message details and obtain consent first. A completed local automation call is not delivery confirmation. Do not use student contacts or critical placement notices in this prototype.

## Run tests safely

```powershell
py -m unittest discover -s automation/tests -t . -v
```

Tests use demo mode and standard-library mocks/validation only. They do not need PyWhatKit installed, open WhatsApp/YouTube, or send messages.

## Configuration and boundaries

`ARYA_AUTOMATION_DEMO=true` is the safe default. There are no WhatsApp credentials or provider keys in this service. PyWhatKit uses local browser automation and the user's existing WhatsApp Web session; it is not a transactional messaging API.

Do not use this package for email OTP, password recovery, secure authentication, account/email verification, institutional role verification, or critical placement notifications. The existing `src/services/authApiService.ts` remains the separate frontend contract for a future backend. When `VITE_AUTH_API_URL` is absent, its existing “service not configured” behavior remains; no OTP or email is generated or claimed. A future auth backend must send email through its server-side provider and keep provider secrets off the client.

The future production flow can expose a protected authenticated backend route such as `POST /automation/whatsapp/reminder`, validate caller permissions/consent, and enqueue work with a durable backend scheduler and official messaging provider. Do not expose this local helper as a public or unauthenticated API.
