from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./smart_travel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    itineraries = relationship("Itinerary", back_populates="user")
    favorite_destinations = relationship("FavoriteDestination", back_populates="user")


class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    preferred_budget_min = Column(Float, nullable=True)
    preferred_budget_max = Column(Float, nullable=True)
    preferred_activities = Column(JSON, default=list)  # ["adventure", "relaxation", "culture"]
    dietary_restrictions = Column(JSON, default=list)
    accessibility_needs = Column(Text, nullable=True)
    preferred_travel_style = Column(String(50), nullable=True)  # luxury, budget, mid-range
    
    user = relationship("User", back_populates="preferences")


class FavoriteDestination(Base):
    __tablename__ = "favorite_destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    destination_name = Column(String(255), nullable=False)
    country = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorite_destinations")


class Itinerary(Base):
    __tablename__ = "itineraries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_budget = Column(Float, nullable=False)
    status = Column(String(50), default="draft")  # draft, confirmed, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="itineraries")
    flights = relationship("FlightBooking", back_populates="itinerary")
    hotels = relationship("HotelBooking", back_populates="itinerary")
    activities = relationship("ActivityBooking", back_populates="itinerary")


class FlightBooking(Base):
    __tablename__ = "flight_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    airline = Column(String(255), nullable=False)
    flight_number = Column(String(50), nullable=False)
    departure_airport = Column(String(10), nullable=False)
    arrival_airport = Column(String(10), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    booking_reference = Column(String(100), nullable=True)
    is_booked = Column(Boolean, default=False)
    
    itinerary = relationship("Itinerary", back_populates="flights")


class HotelBooking(Base):
    __tablename__ = "hotel_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    hotel_name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    check_in_date = Column(DateTime, nullable=False)
    check_out_date = Column(DateTime, nullable=False)
    room_type = Column(String(100), nullable=True)
    price_per_night = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    booking_reference = Column(String(100), nullable=True)
    is_booked = Column(Boolean, default=False)
    
    itinerary = relationship("Itinerary", back_populates="hotels")


class ActivityBooking(Base):
    __tablename__ = "activity_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    activity_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    scheduled_date = Column(DateTime, nullable=False)
    duration_hours = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)  # adventure, cultural, relaxation, etc.
    booking_reference = Column(String(100), nullable=True)
    is_booked = Column(Boolean, default=False)
    
    itinerary = relationship("Itinerary", back_populates="activities")


class TravelHistory(Base):
    __tablename__ = "travel_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    destination = Column(String(255), nullable=False)
    travel_date = Column(DateTime, nullable=False)
    rating = Column(Integer, nullable=True)  # 1-5 user rating
    feedback = Column(Text, nullable=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
