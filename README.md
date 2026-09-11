# Personal Red Team

AI-powered defense training against social engineering. Run safe phishing drills against
yourself, analyze suspicious messages in real time, and track your security posture score —
all in a calm, professional interface.

## Features

- **Attack simulations** — safe, controlled phishing/SMishing drills across 9 attack
  families (authority scams, urgency & fear, curiosity bait, greed, secrecy, tech support…)
  with a full "attack anatomy" reveal: triggers, explanation, and defense tips.
- **Threat analyzer** — paste any suspicious email, SMS, or chat message for instant AI
  analysis: threat level, confidence score, flagged phrases, and recommendations.
- **Analytics** — animated security-posture ring, per-vector vulnerability profile, and
  prioritized next steps.
- **Full auth suite** — registration with strength-metered passwords, email verification,
  password reset, login lockout, JWT access + refresh rotation, and TOTP two-factor auth
  with QR setup and a dedicated sign-in challenge.
- **Hardened API** — rate limiting, CORS, CSP/HSTS security headers, audit logging,
  input sanitization, account lockout.

## Tech stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons   |
| Backend  | FastAPI, SQLAlchemy (async), Pydantic v2, SlowAPI, python-jose    |
| AI       | Server-side NLP services (+ Transformers.js client-side capable)  |
| Email    | Resend (dev mode prints links to console, no key needed)          |
| 2FA      | TOTP via pyotp + QR codes                                         |
| Dev DB   | SQLite · Prod DB: PostgreSQL 16 (docker-compose)                  |
| Tests    | pytest + pytest-asyncio + httpx (62 tests)                        |

## Quickstart (local dev)

**Prerequisites:** Node.js 18+, Python 3.12+.

```bash
# Backend
cd backend
pip install -r requirements.txt
python init_db.py
python -m uvicorn src.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — register and you're in. No email key needed: dev mode
auto-verifies accounts and prints verification/reset links to the backend console.

### With Docker (PostgreSQL)

```bash
# .env at repo root with SECRET_KEY and NEXTAUTH_SECRET, then:
docker-compose up --build
```

## Project structure

```
├── frontend/src
│   ├── app
│   │   ├── page.tsx                  # Marketing landing
│   │   ├── (auth)                    # login, register, forgot/reset password,
│   │   │                             # verify-email, verify-2fa
│   │   └── (dashboard)               # dashboard, simulations, threats,
│   │                                 # analytics, settings (+2FA)
│   ├── components
│   │   ├── ui.tsx                    # Shared kit: cards, stats, rings, badges…
│   │   └── auth.tsx                  # Shared auth shell
│   └── lib/api.ts                    # Typed API client (auto token refresh)
├── backend/src
│   ├── routers                       # auth, simulations, threats, analytics, audit
│   ├── core                          # config, security/JWT, email, lockout, audit
│   ├── models · schemas · services
│   └── main.py                       # App, CORS, security headers
└── backend/tests                     # 62 tests — `pytest` in backend/
```

## API overview

Base URL: `http://localhost:8000/api/v1`

| Area        | Endpoints                                                                        |
| ----------- | -------------------------------------------------------------------------------- |
| Auth        | `POST /auth/register · /login · /refresh · /me`                                  |
| Verification| `POST /auth/verify-email · /resend-verification`                                 |
| Recovery    | `POST /auth/forgot-password · /reset-password`                                   |
| 2FA         | `POST /auth/2fa/setup · /2fa/enable · /2fa/disable · /verify-2fa`                |
| Simulations | `POST /simulations/generate · GET /simulations · GET+POST /simulations/{id}[/reveal]` |
| Threats     | `POST /threats/analyze · GET /threats/history`                                   |
| Analytics   | `GET /analytics/score · /stats · /vulnerabilities`                               |
| Audit       | `GET /audit/events`                                                              |

Interactive docs (dev only): http://localhost:8000/api/v1/docs

## Configuration

Copy `backend/.env.example` to `backend/.env`. Key settings:

| Variable                   | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `SECRET_KEY`               | JWT signing key (**change in production**)           |
| `DATABASE_URL`             | SQLite for dev, `postgresql+asyncpg://…` for prod    |
| `CORS_ORIGINS`             | Allowed frontend origins                             |
| `RESEND_API_KEY`           | Empty = dev mode (auto-verify, console links)        |
| `FRONTEND_URL`             | Used to build verification/reset links in emails     |
| `RATE_LIMIT_AUTH/API`      | e.g. `5/minute`, `60/minute`                         |
| `DEBUG`                    | `true` in dev (docs + relaxed CSP); `false` in prod  |

Frontend: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api/v1`).

## Tests & builds

```bash
cd backend && python -m pytest -q        # 62 tests
cd frontend && npx tsc --noEmit          # type check
cd frontend && npm run build             # production build (13 routes prerendered)
```

## License

MIT
