# BuyBuddy

BuyBuddy is a smart grocery list manager with a warm, market-inspired UI, pantry tracking, voice-assisted entry, and real-time collaboration.

## Features

- Grocery lists with items, categories, quantities, and due dates
- Smart pantry with expiry tracking, low-stock flags, and one-click add-to-list
- Voice-assisted item entry (browser Web Speech API)
- Real-time collaboration with live presence, activity feed, and sharing
- Theme selector with multiple warm color palettes

## Tech Stack

- Frontend: React 19, Vite, Tailwind v4, Zustand
- Backend: Django, Django REST Framework, SimpleJWT
- Realtime: Django Channels + Redis
- Database: SQLite (default)

## Requirements

- Python 3.10+ (3.11+ recommended)
- Node.js 18+ and npm
- Redis (for realtime collaboration)

## Quick Start

### 1) Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
python manage.py runserver
```

Backend runs at http://127.0.0.1:8000

### 2) Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at http://127.0.0.1:5173

## Realtime Collaboration (Redis)

BuyBuddy uses Redis for Channels. By default, it connects to:

- `redis://127.0.0.1:6379/0`

You can change this via `REDIS_URL`.

If you do not have Redis locally, you can run it with Docker:

```bash
docker run --name buybuddy-redis -p 6379:6379 -d redis:7
```

## Environment Variables

Backend reads these optional variables:

- `DJANGO_SECRET_KEY` (default is a local dev key)
- `DJANGO_DEBUG` (default: True)
- `DJANGO_ALLOWED_HOSTS` (default: localhost,127.0.0.1)
- `CORS_ALLOWED_ORIGINS` (default: http://localhost:5173,http://127.0.0.1:5173)
- `REDIS_URL` (default: redis://127.0.0.1:6379/0)

## Scripts

Frontend scripts live in [frontend/README.md](frontend/README.md).

Common backend commands:

```powershell
python manage.py migrate
python manage.py seed_categories
python manage.py runserver
```

## Project Structure

```
backend/   Django API + Channels
frontend/  React + Vite app
```

## API Overview

Base URL: `/api`

Auth:
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/profile/`

Lists:
- `GET /api/lists/`
- `POST /api/lists/`
- `GET /api/lists/{id}/`
- `PUT /api/lists/{id}/`
- `DELETE /api/lists/{id}/`

Items:
- `GET /api/lists/{id}/items/`
- `POST /api/lists/{id}/items/`
- `PATCH /api/items/{id}/toggle/`
- `PUT /api/items/{id}/`
- `DELETE /api/items/{id}/`

Pantry:
- `GET /api/pantry/`
- `GET /api/pantry/items/`
- `POST /api/pantry/items/`
- `GET /api/pantry/items/{id}/`
- `PUT /api/pantry/items/{id}/`
- `DELETE /api/pantry/items/{id}/`
- `PATCH /api/pantry/items/{id}/mark-low/`
- `POST /api/pantry/items/{id}/to-list/`
- `GET /api/pantry/expiring/`

Voice:
- `POST /api/voice/process/` (expects transcript text)
- `POST /api/voice/sessions/{id}/confirm/`
- `GET /api/voice/sessions/`

Collaboration:
- `GET /api/lists/{id}/collaborators/`
- `POST /api/lists/{id}/share-with-user/`
- `POST /api/lists/{id}/unshare-with-user/`
- `GET /api/lists/shared-with-me/`

## WebSocket Endpoint

- `ws://localhost:8000/ws/lists/{id}/?token=ACCESS_TOKEN`

Events are used to sync list changes, item updates, and presence.

## Notes

- Voice input uses the browser Web Speech API. If your browser does not support it, the UI falls back to manual entry.
- Theme selection is stored in localStorage and applied on load.
