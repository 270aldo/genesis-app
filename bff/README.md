# GENESIS BFF (Backend for Frontend)

FastAPI service that acts as the backend layer between the GENESIS mobile app and Supabase/AI agents.

## Prerequisites

- Python 3.12+
- pip

## Local Setup

```bash
cd bff

# Create virtual environment (recommended)
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
uvicorn main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## API Endpoints

| Method | Path                     | Description           |
|--------|--------------------------|-----------------------|
| GET    | `/health`                | Health check          |
| POST   | `/mobile/chat`           | Send chat message     |
| GET    | `/mobile/profile`        | Get user profile      |
| POST   | `/mobile/check-in`       | Submit wellness check-in |
| GET    | `/mobile/sessions`       | List workout sessions |
| POST   | `/mobile/exercise-log`   | Log exercise set data |
| GET    | `/mobile/workout/today`  | Get today's workout   |
| GET    | `/agents/status`         | Agent status (stubs)  |

All `/mobile/*` endpoints require `Authorization: Bearer <supabase_access_token>`.

## Deployment (Docker + Cloud Run)

```bash
# Build
docker build -t genesis-bff .

# Run locally
docker run -p 8000:8000 --env-file .env genesis-bff

# Deploy to Cloud Run
gcloud run deploy genesis-bff \
  --source . \
  --port 8000 \
  --allow-unauthenticated \
  --set-env-vars "CORS_ORIGINS=https://your-app-domain.com"
```
