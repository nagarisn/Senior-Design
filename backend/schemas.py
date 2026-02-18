from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


# Preference Schemas
class UserPreferenceCreate(BaseModel):
    preferred_budget_min: Optional[float] = None
    preferred_budget_max: Optional[float] = None
    preferred_activities: List[str] = []
    dietary_restrictions: List[str] = []
    accessibility_needs: Optional[str] = None
    preferred_travel_style: Optional[str] = None


class UserPreferenceResponse(UserPreferenceCreate):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True


# Travel Search Request
class TravelSearchRequest(BaseModel):
    destination: Optional[str] = None
    origin: str = "JFK"  # Default origin
    start_date: datetime
    end_date: datetime
    budget_min: float = 0
    budget_max: float = 10000
    travelers: int = 1
    interests: List[str] = []
    travel_style: Optional[str] = None  # luxury, mid-range, budget


# Flight Schemas
class FlightOption(BaseModel):
    id: str
    airline: str
    flight_number: str
    departure_airport: str
    arrival_airport: str
    departure_time: datetime
    arrival_time: datetime
    price: float
    duration_minutes: int
    stops: int = 0


class FlightBookingCreate(BaseModel):
    itinerary_id: int
    airline: str
    flight_number: str
    departure_airport: str
    arrival_airport: str
    departure_time: datetime
    arrival_time: datetime
    price: float


class FlightBookingResponse(FlightBookingCreate):
    id: int
    booking_reference: Optional[str]
    is_booked: bool
    
    class Config:
        from_attributes = True


# Hotel Schemas
class HotelOption(BaseModel):
    id: str
    hotel_name: str
    address: str
    rating: float
    price_per_night: float
    total_price: float
    amenities: List[str] = []
    room_type: str
    image_url: Optional[str] = None


class HotelBookingCreate(BaseModel):
    itinerary_id: int
    hotel_name: str
    address: Optional[str]
    check_in_date: datetime
    check_out_date: datetime
    room_type: Optional[str]
    price_per_night: float
    total_price: float
    rating: Optional[float]


class HotelBookingResponse(HotelBookingCreate):
    id: int
    booking_reference: Optional[str]
    is_booked: bool
    
    class Config:
        from_attributes = True


# Activity Schemas
class ActivityOption(BaseModel):
    id: str
    activity_name: str
    description: str
    location: str
    price: float
    duration_hours: float
    category: str
    rating: float
    image_url: Optional[str] = None


class ActivityBookingCreate(BaseModel):
    itinerary_id: int
    activity_name: str
    description: Optional[str]
    location: Optional[str]
    scheduled_date: datetime
    duration_hours: Optional[float]
    price: float
    category: Optional[str]


class ActivityBookingResponse(ActivityBookingCreate):
    id: int
    booking_reference: Optional[str]
    is_booked: bool
    
    class Config:
        from_attributes = True


# Itinerary Schemas
class ItineraryCreate(BaseModel):
    name: str
    destination: str
    start_date: datetime
    end_date: datetime
    total_budget: float


class ItineraryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    destination: str
    start_date: datetime
    end_date: datetime
    total_budget: float
    status: str
    created_at: datetime
    flights: List[FlightBookingResponse] = []
    hotels: List[HotelBookingResponse] = []
    activities: List[ActivityBookingResponse] = []
    
    class Config:
        from_attributes = True


# Recommendation Response
class TravelRecommendation(BaseModel):
    destination: str
    flights: List[FlightOption]
    hotels: List[HotelOption]
    activities: List[ActivityOption]
    estimated_total: float
    budget_remaining: float
    match_score: float  # How well this matches user preferences (0-100)


class RecommendationResponse(BaseModel):
    search_params: TravelSearchRequest
    recommendations: List[TravelRecommendation]
    generated_at: datetime


# Favorite Destination
class FavoriteDestinationCreate(BaseModel):
    destination_name: str
    country: Optional[str] = None
    notes: Optional[str] = None


class FavoriteDestinationResponse(FavoriteDestinationCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
