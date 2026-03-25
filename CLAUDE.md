# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend
```bash
cd backend
# Install dependencies (venv recommended)
pip install -r requirements.txt
# Run dev server (hot reload)
python -m uvicorn main:app --reload
# Interactive API docs
open http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Dev server on :3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

### Environment Setup
Copy `.env.example` to `.env` in the project root. The app runs fully on mock data without any API keys set.

## Architecture

### Request Flow
1. Frontend (`localhost:3000`) sends all API calls to `/api/*`
2. Vite dev server proxies `/api` → `http://localhost:8000`
3. FastAPI handles the request using JWT from the `Authorization: Bearer` header
4. The JWT token is stored in `localStorage` under the key `user` as `user.access_token`

### Backend (`backend/`)
- **`main.py`** — All API routes in a single file. Protected routes use `get_current_user` as a FastAPI `Depends`.
- **`models.py`** — SQLAlchemy ORM. SQLite DB created at `backend/smart_travel.db` on startup via `init_db()`. Key models: `User`, `Itinerary`, `FlightBooking`, `HotelBooking`, `ActivityBooking`, `PriceAlert`, `Notification`.
- **`schemas.py`** — Pydantic v1 schemas for request/response validation. Do **not** add `EmailStr` without also installing `email-validator`.
- **`services.py`** — `FlightService`, `HotelService`, `ActivityService`, `DestinationService`. Each checks for real API keys (`DUFFEL_ACCESS_TOKEN`, `VIATOR_API_KEY`) and falls back to deterministic mock data automatically.
- **`recommendation_engine.py`** — Stateless singleton `recommendation_engine`. Pipeline: destination selection → per-destination flight/hotel/activity fetch → heuristic scoring → top-5 ranked packages. Budget split: 35% flights / 45% hotels / 20% activities.
- **`auth.py`** — JWT (7-day expiry) + bcrypt via `passlib`. Token payload uses `sub` = `user_id`.
- **`scheduler.py`** — APScheduler background job (every 2 min) checks `PriceAlert` rows and creates `Notification` rows when a price drop is detected. Started in FastAPI's `startup` event.
- **`email_service.py`** — SMTP email; silently falls back to `print()` if `SMTP_HOST` is not set.
- **`pdf_service.py`** — `fpdf2`-based PDF export for itineraries, returned as a `StreamingResponse`.

### Frontend (`frontend/src/`)
- **`services/api.js`** — Axios instance with a request interceptor that injects the Bearer token from `localStorage`. All domain calls go through named exports: `userAPI`, `searchAPI`, `itineraryAPI`.
- **`context/AuthContext.jsx`** — Global auth state (user object, login/logout). Wrap with this before accessing user data in any page.
- **`pages/`** — One file per route. `Search.jsx` owns the search form and renders `RecommendationCard` results. `ItineraryDetailPage.jsx` handles the full booking management flow.
- **`components/NotificationBell.jsx`** — Polls `GET /api/users/{id}/notifications` every 30 seconds while the user is logged in.

### Data Flow for Search
`Search.jsx` → `searchAPI.search()` → `POST /api/search` → `recommendation_engine.generate_recommendations()` → `FlightService` / `HotelService` / `ActivityService` (real or mock) → scored `RecommendationResponse` → `RecommendationCard` components.

## Key Constraints
- **No test suite exists** — there are no test files; the 26 API tests noted in project history were run ad-hoc.
- **Single-file backend** — all routes live in `main.py`; avoid splitting into routers unless the file becomes unmanageable.
- **SQLite only** — `check_same_thread=False` is set for FastAPI's async context. Do not swap to PostgreSQL without updating the engine config.
- **Windows / Git Bash** — Python venv is at `venv/Scripts/python.exe`. Export Node path before npm commands if Node is installed via scoop: `export PATH="/c/Users/Sai/scoop/apps/nodejs-lts/current/bin:$PATH"`.
