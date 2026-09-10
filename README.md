# Personal Red Team

AI-Powered Defense Against Social Engineering & Psychological Exploitation

## Overview

Personal Red Team is a consumer cybersecurity application that simulates social engineering attacks to build user resilience and detects manipulation in real-time using AI.

## Architecture

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, SQLAlchemy, PostgreSQL
- **AI**: Hybrid (client-side Transformers.js + server-side Python NLP)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose

### Development

```bash
# Start database
docker-compose up -d db

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn src.main:app --reload
```

## License

MIT
