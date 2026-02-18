"""
Smart Travel - Intelligent Travel Agent System
Main FastAPI Application
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import hashlib

from models import (
    init_db, get_db, User, UserPreference, Itinerary, 
    FlightBooking, HotelBooking, ActivityBooking, FavoriteDestination
)
from schemas import (
    UserCreate, UserResponse, UserLogin, UserPreferenceCreate, UserPreferenceResponse,
    TravelSearchRequest, RecommendationResponse, ItineraryCreate, ItineraryResponse,
    FlightBookingCreate, FlightBookingResponse, HotelBookingCreate, HotelBookingResponse,
    ActivityBookingCreate, ActivityBookingResponse, FavoriteDestinationCreate, FavoriteDestinationResponse
)
from recommendation_engine import recommendation_engine
from services import DestinationService

# Initialize FastAPI app
app = FastAPI(
    title="Smart Travel API",
    description="Intelligent Travel Agent System - Automated Vacation Planner",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()


# ============== Health Check ==============
@app.get("/")
def root():
    return {"message": "Smart Travel API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ============== User Routes ==============
@app.post("/api/users/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (simple hash for demo - use bcrypt in production)
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create default preferences
    prefs = UserPreference(user_id=user.id)
    db.add(prefs)
    db.commit()
    
    return user


@app.post("/api/users/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
    if user.password_hash != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # In production, return JWT token
    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============== User Preferences Routes ==============
@app.get("/api/users/{user_id}/preferences", response_model=UserPreferenceResponse)
def get_user_preferences(user_id: int, db: Session = Depends(get_db)):
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs


@app.put("/api/users/{user_id}/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(
    user_id: int, 
    pref_data: UserPreferenceCreate, 
    db: Session = Depends(get_db)
):
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not prefs:
        prefs = UserPreference(user_id=user_id)
        db.add(prefs)
    
    for key, value in pref_data.model_dump().items():
        setattr(prefs, key, value)
    
    db.commit()
    db.refresh(prefs)
    return prefs


# ============== Travel Search & Recommendations ==============
@app.post("/api/search", response_model=RecommendationResponse)
def search_travel(search_request: TravelSearchRequest, db: Session = Depends(get_db)):
    """
    Main search endpoint - generates personalized travel recommendations
    based on budget, dates, interests, and preferences.
    """
    recommendations = recommendation_engine.generate_recommendations(
        search_request=search_request,
        user_preferences=None  # Can be enhanced to include user prefs
    )
    return recommendations


@app.post("/api/search/user/{user_id}", response_model=RecommendationResponse)
def search_travel_personalized(
    user_id: int,
    search_request: TravelSearchRequest, 
    db: Session = Depends(get_db)
):
    """
    Personalized search - includes user preferences in recommendations
    """
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    user_prefs = None
    
    if prefs:
        user_prefs = {
            "budget_min": prefs.preferred_budget_min,
            "budget_max": prefs.preferred_budget_max,
            "activities": prefs.preferred_activities,
            "travel_style": prefs.preferred_travel_style
        }
        
        # Merge user preferences with search request
        if not search_request.interests and prefs.preferred_activities:
            search_request.interests = prefs.preferred_activities
        if not search_request.travel_style and prefs.preferred_travel_style:
            search_request.travel_style = prefs.preferred_travel_style
    
    recommendations = recommendation_engine.generate_recommendations(
        search_request=search_request,
        user_preferences=user_prefs
    )
    return recommendations


@app.get("/api/destinations")
def get_destinations():
    """Get list of popular destinations"""
    return DestinationService.get_popular_destinations()


@app.get("/api/airports")
def get_airports():
    """Get list of airports for origin selection"""
    airports = [
        {"code": "JFK", "name": "John F. Kennedy International", "city": "New York"},
        {"code": "LAX", "name": "Los Angeles International", "city": "Los Angeles"},
        {"code": "ORD", "name": "O'Hare International", "city": "Chicago"},
        {"code": "ATL", "name": "Hartsfield-Jackson Atlanta International", "city": "Atlanta"},
        {"code": "DFW", "name": "Dallas/Fort Worth International", "city": "Dallas"},
        {"code": "DEN", "name": "Denver International", "city": "Denver"},
        {"code": "SFO", "name": "San Francisco International", "city": "San Francisco"},
        {"code": "SEA", "name": "Seattle-Tacoma International", "city": "Seattle"},
        {"code": "MIA", "name": "Miami International", "city": "Miami"},
        {"code": "BOS", "name": "Boston Logan International", "city": "Boston"},
        {"code": "EWR", "name": "Newark Liberty International", "city": "Newark"},
        {"code": "IAH", "name": "George Bush Intercontinental", "city": "Houston"},
        {"code": "MSP", "name": "Minneapolis-Saint Paul International", "city": "Minneapolis"},
        {"code": "DTW", "name": "Detroit Metropolitan", "city": "Detroit"},
        {"code": "PHL", "name": "Philadelphia International", "city": "Philadelphia"},
    ]
    return airports


# ============== Itinerary Routes ==============
@app.post("/api/itineraries", response_model=ItineraryResponse)
def create_itinerary(
    user_id: int,
    itinerary_data: ItineraryCreate,
    db: Session = Depends(get_db)
):
    itinerary = Itinerary(
        user_id=user_id,
        **itinerary_data.model_dump()
    )
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)
    return itinerary


@app.get("/api/itineraries/user/{user_id}", response_model=List[ItineraryResponse])
def get_user_itineraries(user_id: int, db: Session = Depends(get_db)):
    itineraries = db.query(Itinerary).filter(Itinerary.user_id == user_id).all()
    return itineraries


@app.get("/api/itineraries/{itinerary_id}", response_model=ItineraryResponse)
def get_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


@app.put("/api/itineraries/{itinerary_id}/status")
def update_itinerary_status(
    itinerary_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    valid_statuses = ["draft", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    itinerary.status = status
    db.commit()
    return {"message": "Status updated", "new_status": status}


@app.delete("/api/itineraries/{itinerary_id}")
def delete_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    db.delete(itinerary)
    db.commit()
    return {"message": "Itinerary deleted"}


# ============== Booking Routes ==============
@app.post("/api/itineraries/{itinerary_id}/flights", response_model=FlightBookingResponse)
def add_flight_to_itinerary(
    itinerary_id: int,
    flight_data: FlightBookingCreate,
    db: Session = Depends(get_db)
):
    flight = FlightBooking(itinerary_id=itinerary_id, **flight_data.model_dump(exclude={'itinerary_id'}))
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight


@app.post("/api/itineraries/{itinerary_id}/hotels", response_model=HotelBookingResponse)
def add_hotel_to_itinerary(
    itinerary_id: int,
    hotel_data: HotelBookingCreate,
    db: Session = Depends(get_db)
):
    hotel = HotelBooking(itinerary_id=itinerary_id, **hotel_data.model_dump(exclude={'itinerary_id'}))
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel


@app.post("/api/itineraries/{itinerary_id}/activities", response_model=ActivityBookingResponse)
def add_activity_to_itinerary(
    itinerary_id: int,
    activity_data: ActivityBookingCreate,
    db: Session = Depends(get_db)
):
    activity = ActivityBooking(itinerary_id=itinerary_id, **activity_data.model_dump(exclude={'itinerary_id'}))
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


# ============== Favorite Destinations ==============
@app.post("/api/users/{user_id}/favorites", response_model=FavoriteDestinationResponse)
def add_favorite_destination(
    user_id: int,
    favorite_data: FavoriteDestinationCreate,
    db: Session = Depends(get_db)
):
    favorite = FavoriteDestination(user_id=user_id, **favorite_data.model_dump())
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@app.get("/api/users/{user_id}/favorites", response_model=List[FavoriteDestinationResponse])
def get_favorite_destinations(user_id: int, db: Session = Depends(get_db)):
    favorites = db.query(FavoriteDestination).filter(FavoriteDestination.user_id == user_id).all()
    return favorites


@app.delete("/api/users/{user_id}/favorites/{favorite_id}")
def remove_favorite_destination(
    user_id: int,
    favorite_id: int,
    db: Session = Depends(get_db)
):
    favorite = db.query(FavoriteDestination).filter(
        FavoriteDestination.id == favorite_id,
        FavoriteDestination.user_id == user_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    return {"message": "Favorite removed"}


# ============== Run the application ==============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
