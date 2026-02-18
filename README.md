# Final Fall Design Report

## Smart Travel
Agent that plans and books entire vacations. A user could provide a budget, travel dates, and interests (e.g., "a relaxing beach vacation in Southeast Asia for under $2,000"), and the agent would research destinations, compare flight and hotel options, and present a complete, bookable itinerary.

**Team Members:**
- Sethu Kruthin Nagari – Major: Computer Science – Email: nagarisn@mail.uc.edu
- Sai Venkata Subhash Vakkalagadda – Major: Computer Science – Email: vakkalsh@mail.uc.edu

**Advisor:** Dr. Nitin Nitin

---

# 📄 Table of Contents

1. [Team Names & Project Abstract](Team-Abstract.md)
2. [Project Description](Project-Description.md)
3. **User Stories & Design Diagrams**
   - [User Stories](User_Stories.md)
   - [Design Diagrams – Level 0, Level 1, Level 2](Design%20Diagrams/Design%20Diagrams.pdf)
4. **Project Tasks & Timeline**
   - [Task List](TaskList.md)
   - [Timeline & Effort Matrix](Milestones-Timeline-Effortmatrix.md)
5. [ABET Concerns Essay](Constraints_SmartTravel.md)
6. [PPT Slideshow](Smart_Travel_Presentation%20copy.pptx)
7. [Self-Assessment Essays](Assignment%20%233%20-%20Team%20Contract%20and%20Individual%20Capstone%20Assessment)
8. [Professional Biographies](Professional_Biographies)
9. [Summary of Expenses]()
   - Not Applicable
10. **Appendix**
   - [Meeting Notes](Fall_Semester%20Meeting_Notes.pdf)

---

# 🚀 Application – Developer Guide

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic v2
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Project Structure

```
smart-travel/
├── backend/
│   ├── main.py                   # FastAPI app & all routes
│   ├── models.py                 # SQLAlchemy DB models
│   ├── schemas.py                # Pydantic schemas
│   ├── services.py               # Mock travel data services
│   ├── recommendation_engine.py  # AI scoring & ranking logic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # All pages & components
│   │   ├── main.jsx              # Entry point
│   │   ├── index.css             # Tailwind + custom styles
│   │   └── services/
│   │       └── api.js            # Axios API service layer
│   ├── package.json
│   ├── vite.config.js            # Proxy /api → localhost:8000
│   └── tailwind.config.js
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register user |
| POST | `/api/users/login` | Login |
| GET | `/api/users/{id}/preferences` | Get preferences |
| PUT | `/api/users/{id}/preferences` | Update preferences |
| POST | `/api/search` | Search travel options |
| POST | `/api/search/user/{id}` | Personalized search |
| GET | `/api/destinations` | Popular destinations |
| GET | `/api/airports` | US departure airports |
| POST | `/api/itineraries` | Create itinerary |
| GET | `/api/itineraries/user/{id}` | User's itineraries |
| POST | `/api/itineraries/{id}/flights` | Add flight |
| POST | `/api/itineraries/{id}/hotels` | Add hotel |
| POST | `/api/itineraries/{id}/activities` | Add activity |
| POST | `/api/users/{id}/favorites` | Add favorite |
| GET | `/api/users/{id}/favorites` | Get favorites |

## Recommendation Engine

Multi-factor AI scoring system:
1. **Flights** – price efficiency (30pts), direct flight bonus (20pts), departure time (10pts)
2. **Hotels** – rating (25pts), value for money (25pts), travel style match (15pts), amenities (15pts)
3. **Activities** – interest matching (30pts), rating (20pts), value ratio (15pts)
4. **Match Score** – overall package score (0–100) based on budget fit + interest coverage + quality
