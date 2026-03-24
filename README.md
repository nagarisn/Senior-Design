# Smart Travel — AI-Powered Vacation Planner

![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)

**Smart Travel** is a full-stack AI-powered travel agent built as a Senior Design Capstone project at the University of Cincinnati. Users enter a budget, dates, and interests — the system returns ranked flight, hotel, and activity packages, lets users book and manage itineraries, and monitors prices in the background.

---

## Features

### Search & Recommendations
- Multi-factor AI scoring engine ranks flights, hotels, and activities (0–100% match score)
- Budget-aware allocation (35% flights / 45% hotels / 20% activities)
- Real API integrations: **Duffel** (flights) and **Viator** (activities)
- Automatic fallback to realistic mock data if API keys are absent

### Itinerary Management
- Create, view, edit, and delete itineraries
- Add or remove individual flights, hotels, and activities
- Status workflow: `draft → confirmed → completed`
- Export any itinerary to a formatted **PDF**
- Simulated checkout / payment flow

### Notifications & Alerts
- **Price alerts** — set a target price per destination; get notified when it's reached
- **In-app notification bell** — real-time badge with unread count, 30-second polling
- Background scheduler checks for price drops every 2 minutes
- Email notifications via SMTP (falls back to console log if not configured)

### User System
- JWT authentication (7-day tokens) with bcrypt password hashing
- Saved preferences: budget ceiling, travel style, interests
- Favorite destinations
- Collaborative itineraries (invite other users as editors/viewers)

### Frontend
- Dark-mode glassmorphism UI — React 18, Tailwind CSS, Framer Motion
- React Context for global auth state (`AuthContext`)
- Responsive — mobile, tablet, desktop
- Progressive Web App (PWA) with offline caching

---

## Project Structure

```
smart-travel/
├── backend/
│   ├── main.py                  # All API routes (FastAPI)
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── services.py              # Duffel, Viator, mock data services
│   ├── recommendation_engine.py # Scoring & ranking logic
│   ├── auth.py                  # JWT + bcrypt
│   ├── email_service.py         # SMTP email (console fallback)
│   ├── pdf_service.py           # PDF generation (fpdf2)
│   ├── scheduler.py             # Background price-drop monitor (APScheduler)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx            # Search form + recommendation cards
│   │   │   ├── Login.jsx             # Login / Register
│   │   │   ├── Itineraries.jsx       # All itineraries list
│   │   │   ├── ItineraryDetailPage.jsx # Single itinerary view/edit
│   │   │   ├── Favorites.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AlertsPage.jsx        # Price alerts management
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx  # Live notification dropdown
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── CheckoutSimulation.jsx
│   │   │   └── SearchableDropdown.jsx
│   │   └── services/
│   │       └── api.js               # Axios client with JWT interceptor
│   └── package.json
│
├── docs/                        # Capstone documentation
├── .env.example                 # Environment variable template
└── README.md
```

---

## Getting Started

You need **two terminals** — one for the backend, one for the frontend.

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
API docs available at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: `http://localhost:3000`

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in your keys. The app runs fully on mock data without any keys.

| Variable | Description |
|---|---|
| `DUFFEL_ACCESS_TOKEN` | Duffel API key for live flight search |
| `VIATOR_API_KEY` | Viator API key for live activity search |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` | Gmail or Mailtrap for real emails |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register |
| POST | `/api/users/login` | Login → JWT |
| POST | `/api/search` | Get recommendations |
| POST | `/api/itineraries` | Create itinerary |
| GET | `/api/itineraries/{id}` | Get itinerary with all bookings |
| GET | `/api/itineraries/{id}/export/pdf` | Download PDF |
| POST | `/api/users/{id}/alerts` | Create price alert |
| GET | `/api/users/{id}/notifications` | Get notifications |

Full interactive docs: `http://localhost:8000/docs`

---

## Team

| Name | Program |
|---|---|
| Sai Venkata Subhash Vakkalagadda | Computer Science, University of Cincinnati |
| Sethu Kruthin Nagari | Computer Science, University of Cincinnati |

Faculty Advisor: Dr. Nitin, Department of EECS
