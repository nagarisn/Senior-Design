"""
Mock Travel Data Services
These services simulate external API responses for flights, hotels, and activities.
Design is modular - swap these with real API integrations (Amadeus, Booking.com, etc.) later.
"""

import random
from datetime import datetime, timedelta
from typing import List, Optional
from schemas import FlightOption, HotelOption, ActivityOption, TravelSearchRequest
import uuid


# Sample data for mock generation
AIRLINES = [
    {"name": "Delta Airlines", "code": "DL"},
    {"name": "United Airlines", "code": "UA"},
    {"name": "American Airlines", "code": "AA"},
    {"name": "JetBlue", "code": "B6"},
    {"name": "Southwest", "code": "WN"},
    {"name": "Alaska Airlines", "code": "AS"},
]

DESTINATIONS = {
    "paris": {"airport": "CDG", "country": "France", "base_price": 600, "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80"},
    "london": {"airport": "LHR", "country": "UK", "base_price": 550, "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80"},
    "tokyo": {"airport": "NRT", "country": "Japan", "base_price": 900, "image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80"},
    "new york": {"airport": "JFK", "country": "USA", "base_price": 300, "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80"},
    "los angeles": {"airport": "LAX", "country": "USA", "base_price": 350, "image": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80"},
    "miami": {"airport": "MIA", "country": "USA", "base_price": 280, "image": "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&q=80"},
    "rome": {"airport": "FCO", "country": "Italy", "base_price": 650, "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80"},
    "barcelona": {"airport": "BCN", "country": "Spain", "base_price": 580, "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80"},
    "sydney": {"airport": "SYD", "country": "Australia", "base_price": 1200, "image": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80"},
    "dubai": {"airport": "DXB", "country": "UAE", "base_price": 750, "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80"},
    "bali": {"airport": "DPS", "country": "Indonesia", "base_price": 850, "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80"},
    "cancun": {"airport": "CUN", "country": "Mexico", "base_price": 400, "image": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=600&q=80"},
    "hawaii": {"airport": "HNL", "country": "USA", "base_price": 500, "image": "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=600&q=80"},
    "las vegas": {"airport": "LAS", "country": "USA", "base_price": 250, "image": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=600&q=80"},
    "san francisco": {"airport": "SFO", "country": "USA", "base_price": 320, "image": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80"},
}

HOTEL_CHAINS = {
    "luxury": [
        {"name": "The Ritz-Carlton", "base_price": 450, "rating": 4.9},
        {"name": "Four Seasons", "base_price": 500, "rating": 4.8},
        {"name": "Waldorf Astoria", "base_price": 420, "rating": 4.7},
        {"name": "St. Regis", "base_price": 480, "rating": 4.8},
    ],
    "mid-range": [
        {"name": "Marriott", "base_price": 180, "rating": 4.3},
        {"name": "Hilton", "base_price": 170, "rating": 4.2},
        {"name": "Hyatt", "base_price": 190, "rating": 4.4},
        {"name": "Sheraton", "base_price": 160, "rating": 4.1},
    ],
    "budget": [
        {"name": "Holiday Inn", "base_price": 100, "rating": 3.8},
        {"name": "Best Western", "base_price": 90, "rating": 3.7},
        {"name": "La Quinta", "base_price": 85, "rating": 3.6},
        {"name": "Comfort Inn", "base_price": 80, "rating": 3.5},
    ],
}

ACTIVITIES_BY_CATEGORY = {
    "adventure": [
        {"name": "Hiking Tour", "base_price": 75, "duration": 4},
        {"name": "Kayaking Adventure", "base_price": 90, "duration": 3},
        {"name": "Zip Line Experience", "base_price": 120, "duration": 2},
        {"name": "Scuba Diving", "base_price": 150, "duration": 4},
        {"name": "Paragliding", "base_price": 180, "duration": 2},
    ],
    "culture": [
        {"name": "Museum Tour", "base_price": 40, "duration": 3},
        {"name": "Historical Walking Tour", "base_price": 35, "duration": 2.5},
        {"name": "Art Gallery Visit", "base_price": 25, "duration": 2},
        {"name": "Local Cooking Class", "base_price": 85, "duration": 3},
        {"name": "Traditional Dance Show", "base_price": 60, "duration": 2},
    ],
    "relaxation": [
        {"name": "Spa Day Package", "base_price": 150, "duration": 4},
        {"name": "Beach Club Access", "base_price": 80, "duration": 6},
        {"name": "Yoga Retreat", "base_price": 65, "duration": 2},
        {"name": "Sunset Cruise", "base_price": 95, "duration": 3},
        {"name": "Wine Tasting Tour", "base_price": 110, "duration": 3},
    ],
    "food": [
        {"name": "Food Walking Tour", "base_price": 70, "duration": 3},
        {"name": "Fine Dining Experience", "base_price": 200, "duration": 2.5},
        {"name": "Street Food Adventure", "base_price": 45, "duration": 2},
        {"name": "Vineyard Tour & Tasting", "base_price": 130, "duration": 4},
        {"name": "Local Market Tour", "base_price": 55, "duration": 2},
    ],
    "nightlife": [
        {"name": "Pub Crawl", "base_price": 50, "duration": 4},
        {"name": "Rooftop Bar Experience", "base_price": 80, "duration": 3},
        {"name": "Jazz Club Night", "base_price": 65, "duration": 3},
        {"name": "Casino Night", "base_price": 100, "duration": 4},
    ],
}


class FlightService:
    """Mock flight search service - replace with real API (Amadeus, Skyscanner, etc.)"""
    
    @staticmethod
    def search_flights(
        origin: str,
        destination: str,
        departure_date: datetime,
        return_date: Optional[datetime] = None,
        budget_max: float = 10000,
        travelers: int = 1
    ) -> List[FlightOption]:
        
        dest_info = DESTINATIONS.get(destination.lower())
        if not dest_info:
            # Default for unknown destinations
            dest_info = {"airport": destination[:3].upper(), "country": "Unknown", "base_price": 500}
        
        flights = []
        
        # Generate 3-5 outbound flight options
        num_flights = random.randint(3, 5)
        for i in range(num_flights):
            airline = random.choice(AIRLINES)
            
            # Price variation
            base = dest_info["base_price"]
            price_variation = random.uniform(0.8, 1.4)
            price = round(base * price_variation * travelers, 2)
            
            if price > budget_max:
                continue
            
            # Random departure time
            hour = random.randint(6, 22)
            dep_time = departure_date.replace(hour=hour, minute=random.choice([0, 15, 30, 45]))
            
            # Flight duration (based on rough distance)
            duration = random.randint(120, 840)  # 2-14 hours
            arr_time = dep_time + timedelta(minutes=duration)
            
            stops = 0 if random.random() > 0.4 else random.randint(1, 2)
            
            flights.append(FlightOption(
                id=str(uuid.uuid4())[:8],
                airline=airline["name"],
                flight_number=f"{airline['code']}{random.randint(100, 9999)}",
                departure_airport=origin.upper(),
                arrival_airport=dest_info["airport"],
                departure_time=dep_time,
                arrival_time=arr_time,
                price=price,
                duration_minutes=duration,
                stops=stops
            ))
        
        # Sort by price
        flights.sort(key=lambda x: x.price)
        return flights


class HotelService:
    """Mock hotel search service - replace with real API (Booking.com, Hotels.com, etc.)"""
    
    @staticmethod
    def search_hotels(
        destination: str,
        check_in: datetime,
        check_out: datetime,
        budget_max: float = 5000,
        travel_style: str = "mid-range",
        guests: int = 1
    ) -> List[HotelOption]:
        
        num_nights = (check_out - check_in).days
        if num_nights < 1:
            num_nights = 1
        
        hotels = []
        
        # Determine which hotel tiers to include based on travel style
        if travel_style == "luxury":
            tiers = ["luxury", "mid-range"]
        elif travel_style == "budget":
            tiers = ["budget", "mid-range"]
        else:
            tiers = ["luxury", "mid-range", "budget"]
        
        for tier in tiers:
            for hotel_template in HOTEL_CHAINS.get(tier, []):
                # Price variation based on destination and randomness
                price_mult = random.uniform(0.85, 1.25)
                price_per_night = round(hotel_template["base_price"] * price_mult, 2)
                total_price = round(price_per_night * num_nights, 2)
                
                if total_price > budget_max:
                    continue
                
                # Add location variation to name
                location_suffix = random.choice(["Downtown", "City Center", "Airport", "Beach", "Old Town", ""])
                hotel_name = f"{hotel_template['name']} {destination.title()} {location_suffix}".strip()
                
                amenities = random.sample([
                    "Free WiFi", "Pool", "Gym", "Spa", "Restaurant", 
                    "Room Service", "Airport Shuttle", "Parking", "Bar",
                    "Business Center", "Concierge", "Pet Friendly"
                ], k=random.randint(4, 8))
                
                room_types = ["Standard Room", "Deluxe Room", "Suite", "King Room", "Double Room"]
                
                hotels.append(HotelOption(
                    id=str(uuid.uuid4())[:8],
                    hotel_name=hotel_name,
                    address=f"123 Main Street, {destination.title()}",
                    rating=round(hotel_template["rating"] + random.uniform(-0.2, 0.2), 1),
                    price_per_night=price_per_night,
                    total_price=total_price,
                    amenities=amenities,
                    room_type=random.choice(room_types),
                    image_url=None
                ))
        
        # Sort by rating (best first)
        hotels.sort(key=lambda x: x.rating, reverse=True)
        return hotels


class ActivityService:
    """Mock activity search service - replace with real API (Viator, GetYourGuide, etc.)"""
    
    @staticmethod
    def search_activities(
        destination: str,
        start_date: datetime,
        end_date: datetime,
        interests: List[str] = None,
        budget_max: float = 1000
    ) -> List[ActivityOption]:
        
        if not interests:
            interests = ["culture", "food", "relaxation"]
        
        activities = []
        
        # Expand interests to include related categories
        all_categories = set(interests)
        if "adventure" in interests:
            all_categories.add("adventure")
        if "food" in interests or "culinary" in interests:
            all_categories.add("food")
        if "relaxation" in interests or "spa" in interests:
            all_categories.add("relaxation")
        if "culture" in interests or "history" in interests:
            all_categories.add("culture")
        if "nightlife" in interests or "entertainment" in interests:
            all_categories.add("nightlife")
        
        # If no matches, include general categories
        if not all_categories:
            all_categories = {"culture", "food", "relaxation"}
        
        for category in all_categories:
            category_activities = ACTIVITIES_BY_CATEGORY.get(category, [])
            
            for activity_template in category_activities:
                # Price variation
                price = round(activity_template["base_price"] * random.uniform(0.9, 1.3), 2)
                
                if price > budget_max:
                    continue
                
                # Localize the activity name
                activity_name = f"{activity_template['name']} in {destination.title()}"
                
                activities.append(ActivityOption(
                    id=str(uuid.uuid4())[:8],
                    activity_name=activity_name,
                    description=f"Experience an amazing {activity_template['name'].lower()} during your visit to {destination.title()}. Perfect for travelers interested in {category}.",
                    location=f"{destination.title()} City Center",
                    price=price,
                    duration_hours=activity_template["duration"],
                    category=category,
                    rating=round(random.uniform(4.0, 5.0), 1),
                    image_url=None
                ))
        
        # Sort by rating
        activities.sort(key=lambda x: x.rating, reverse=True)
        return activities


# Aggregate service for destination suggestions
class DestinationService:
    """Service to suggest destinations based on preferences"""
    
    @staticmethod
    def get_popular_destinations() -> List[dict]:
        return [
            {"name": dest.title(), "airport": info["airport"], "country": info["country"], "image": info.get("image", "")}
            for dest, info in DESTINATIONS.items()
        ]
    
    @staticmethod
    def suggest_destinations(
        budget: float,
        interests: List[str],
        travel_style: str = "mid-range"
    ) -> List[str]:
        """Suggest destinations based on budget and interests"""
        suggestions = []
        
        for dest, info in DESTINATIONS.items():
            # Simple scoring based on budget fit
            if info["base_price"] * 2 <= budget:  # Flight cost * 2 as rough estimate
                score = 100 - abs(info["base_price"] - budget/4)
                suggestions.append((dest, score))
        
        # Sort by score and return top 5
        suggestions.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in suggestions[:5]]
