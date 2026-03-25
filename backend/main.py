"""
Smart Travel - Intelligent Travel Agent System
Main FastAPI Application
"""

import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import hashlib

from models import (
    init_db, get_db, User, UserPreference, Itinerary,
    FlightBooking, HotelBooking, ActivityBooking, FavoriteDestination, ItineraryCollaborator,
    PriceAlert, Notification
)
from schemas import (
    UserCreate, UserResponse, UserLogin, UserUpdate, UserPreferenceCreate, UserPreferenceResponse,
    TravelSearchRequest, RecommendationResponse, ItineraryCreate, ItineraryUpdate, ItineraryResponse,
    FlightBookingCreate, FlightBookingResponse, HotelBookingCreate, HotelBookingResponse,
    ActivityBookingCreate, ActivityBookingResponse, FavoriteDestinationCreate, FavoriteDestinationResponse,
    PriceAlertCreate, PriceAlertResponse, NotificationResponse
)
from recommendation_engine import recommendation_engine
from services import DestinationService
from typing import Optional
from auth import verify_password, get_password_hash, create_access_token, decode_token, oauth2_scheme
from email_service import EmailService
from pdf_service import PDFService
from fastapi.responses import StreamingResponse
from scheduler import start_scheduler
import time

# Initialize FastAPI app
app = FastAPI(
    title="Smart Travel API",
    description="Intelligent Travel Agent System - Automated Vacation Planner",
    version="1.0.0"
)

# CORS middleware for frontend
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    start_scheduler()


# ============== Health Check ==============
@app.get("/")
def root():
    return {"message": "Smart Travel API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Dependency for protecting routes
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"})
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    return user


# ============== User Routes ==============
@app.post("/api/users/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (using bcrypt from auth module)
    password_hash = get_password_hash(user_data.password)
    
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
    
    if not verify_password(login_data.password, user.password_hash):
        # Fallback for old sha256 hashes if testing legacy data
        old_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
        if user.password_hash != old_hash:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


@app.post("/api/users/logout")
def logout_user():
    return {"message": "Logged out successfully"}


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this profile")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.name is not None:
        user.name = user_data.name
    if user_data.email is not None:
        existing = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_data.email

    db.commit()
    db.refresh(user)
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
        {"code": "BOM", "name": "Chhatrapati Shivaji Maharaj International", "city": "Mumbai"},
        {"code": "DEL", "name": "Indira Gandhi International", "city": "Delhi"},
        {"code": "BLR", "name": "Kempegowda International", "city": "Bengaluru"},
        {"code": "MAA", "name": "Chennai International", "city": "Chennai"},
        {"code": "HYD", "name": "Rajiv Gandhi International", "city": "Hyderabad"},
        {"code": "LHR", "name": "Heathrow Airport", "city": "London"},
        {"code": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris"},
        {"code": "DXB", "name": "Dubai International", "city": "Dubai"},
        {"code": "SIN", "name": "Changi Airport", "city": "Singapore"},
        {"code": "NRT", "name": "Narita International", "city": "Tokyo"},
        {"code": "SYD", "name": "Kingsford Smith Airport", "city": "Sydney"},
        {"code": "YYZ", "name": "Toronto Pearson International", "city": "Toronto"},
        {"code": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt"},
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


@app.put("/api/itineraries/{itinerary_id}", response_model=ItineraryResponse)
def update_itinerary(
    itinerary_id: int,
    itinerary_data: ItineraryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    if itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in itinerary_data.model_dump(exclude_none=True).items():
        setattr(itinerary, key, value)

    db.commit()
    db.refresh(itinerary)
    return itinerary


@app.put("/api/itineraries/{itinerary_id}/status")
def update_itinerary_status(itinerary_id: int, status: str, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    valid_statuses = ["draft", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    itinerary.status = status
    db.commit()

    if status == "confirmed":
        notif = Notification(
            user_id=itinerary.user_id,
            type="booking_confirmed",
            message=f"Your trip to {itinerary.destination.title()} has been confirmed!"
        )
        db.add(notif)
        db.commit()

    return {"message": "Payment successful", "status": itinerary.status}


@app.post("/api/itineraries/{itinerary_id}/collaborators")
def add_collaborator(itinerary_id: int, email: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    if itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can add collaborators")
        
    invited_user = db.query(User).filter(User.email == email).first()
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing = db.query(ItineraryCollaborator).filter(
        ItineraryCollaborator.itinerary_id == itinerary_id,
        ItineraryCollaborator.user_id == invited_user.id
    ).first()
    
    if existing:
        return {"message": "User is already a collaborator", "role": existing.role}
        
    collab = ItineraryCollaborator(
        itinerary_id=itinerary_id,
        user_id=invited_user.id,
        role="editor"
    )
    db.add(collab)
    db.commit()
    
    EmailService.send_confirmation_email(
        user_email=invited_user.email,
        user_name=invited_user.name,
        itinerary_name=f"Invitation to collaborate: {itinerary.name}",
        total_price=0.0
    )

    notif = Notification(
        user_id=invited_user.id,
        type="collaborator_added",
        message=f"You've been invited to collaborate on '{itinerary.name}' by {current_user.name}."
    )
    db.add(notif)
    db.commit()

    return {"message": "Collaborator added successfully", "user_id": invited_user.id}


@app.delete("/api/itineraries/{itinerary_id}")
def delete_itinerary(itinerary_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    # Simple check: only creator can delete for now
    if itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(itinerary)
    db.commit()
    return {"message": "Itinerary deleted successfully"}


@app.get("/api/itineraries/{itinerary_id}/export/pdf")
def get_itinerary_pdf(itinerary_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
        
    # Check authorization
    if itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    pdf_bytes_io = PDFService.generate_itinerary_pdf(itinerary, current_user)
    
    headers = {
        'Content-Disposition': f'attachment; filename="SmartTravel_Itinerary_{itinerary_id}.pdf"'
    }
    
    return StreamingResponse(pdf_bytes_io, headers=headers, media_type="application/pdf")


# ============== Booking Routes ==============
@app.delete("/api/itineraries/{itinerary_id}/flights/{flight_id}")
def remove_flight(
    itinerary_id: int,
    flight_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    flight = db.query(FlightBooking).filter(
        FlightBooking.id == flight_id, FlightBooking.itinerary_id == itinerary_id
    ).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    db.delete(flight)
    db.commit()
    return {"message": "Flight removed"}


@app.delete("/api/itineraries/{itinerary_id}/hotels/{hotel_id}")
def remove_hotel(
    itinerary_id: int,
    hotel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    hotel = db.query(HotelBooking).filter(
        HotelBooking.id == hotel_id, HotelBooking.itinerary_id == itinerary_id
    ).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    db.delete(hotel)
    db.commit()
    return {"message": "Hotel removed"}


@app.delete("/api/itineraries/{itinerary_id}/activities/{activity_id}")
def remove_activity(
    itinerary_id: int,
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    activity = db.query(ActivityBooking).filter(
        ActivityBooking.id == activity_id, ActivityBooking.itinerary_id == itinerary_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"message": "Activity removed"}


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


# ============== Price Alerts ==============
@app.post("/api/users/{user_id}/alerts", response_model=PriceAlertResponse)
def create_price_alert(
    user_id: int,
    alert_data: PriceAlertCreate,
    db: Session = Depends(get_db)
):
    alert = PriceAlert(user_id=user_id, **alert_data.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@app.get("/api/users/{user_id}/alerts", response_model=List[PriceAlertResponse])
def get_price_alerts(user_id: int, db: Session = Depends(get_db)):
    return db.query(PriceAlert).filter(PriceAlert.user_id == user_id).all()


@app.delete("/api/users/{user_id}/alerts/{alert_id}")
def delete_price_alert(user_id: int, alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id, PriceAlert.user_id == user_id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}


# ============== Notifications ==============
@app.get("/api/users/{user_id}/notifications", response_model=List[NotificationResponse])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(50).all()


@app.put("/api/users/{user_id}/notifications/{notification_id}/read")
def mark_notification_read(user_id: int, notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user_id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@app.put("/api/users/{user_id}/notifications/read-all")
def mark_all_notifications_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == user_id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# ============== Destination Details ==============
@app.get("/api/destinations/{destination}/details")
def get_destination_details(destination: str):
    from services import DESTINATIONS
    dest_key = destination.lower()
    info = DESTINATIONS.get(dest_key)
    if not info:
        raise HTTPException(status_code=404, detail="Destination not found")
    return {
        "name": destination.title(),
        "airport": info["airport"],
        "country": info["country"],
        "image": info.get("image", ""),
        "base_price": info["base_price"]
    }


# ============== Run the application ==============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
