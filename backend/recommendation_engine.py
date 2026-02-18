"""
Smart Travel Recommendation Engine
Uses heuristic search, filtering, and ranking to match user preferences with optimal travel options.
"""

from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from schemas import (
    TravelSearchRequest, TravelRecommendation, RecommendationResponse,
    FlightOption, HotelOption, ActivityOption
)
from services import FlightService, HotelService, ActivityService, DestinationService


class RecommendationEngine:
    """
    AI-powered recommendation engine that:
    1. Filters options based on hard constraints (budget, dates)
    2. Scores options based on user preferences
    3. Ranks and returns optimal combinations
    """
    
    def __init__(self):
        self.flight_service = FlightService()
        self.hotel_service = HotelService()
        self.activity_service = ActivityService()
        self.destination_service = DestinationService()
    
    def generate_recommendations(
        self,
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> RecommendationResponse:
        """
        Main recommendation pipeline:
        1. Determine destinations to search
        2. For each destination, find best flights, hotels, activities
        3. Score and rank complete packages
        4. Return top recommendations
        """
        
        destinations = self._get_target_destinations(search_request)
        recommendations = []
        
        for destination in destinations:
            recommendation = self._build_recommendation(
                destination=destination,
                search_request=search_request,
                user_preferences=user_preferences
            )
            if recommendation:
                recommendations.append(recommendation)
        
        # Sort by match score
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        return RecommendationResponse(
            search_params=search_request,
            recommendations=recommendations[:5],  # Top 5 recommendations
            generated_at=datetime.utcnow()
        )
    
    def _get_target_destinations(self, search_request: TravelSearchRequest) -> List[str]:
        """Determine which destinations to search"""
        
        if search_request.destination:
            # User specified a destination
            return [search_request.destination.lower()]
        
        # Suggest destinations based on budget and interests
        suggestions = self.destination_service.suggest_destinations(
            budget=search_request.budget_max,
            interests=search_request.interests,
            travel_style=search_request.travel_style or "mid-range"
        )
        
        return suggestions[:3]  # Search top 3 suggested destinations
    
    def _build_recommendation(
        self,
        destination: str,
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> Optional[TravelRecommendation]:
        """Build a complete travel recommendation for a destination"""
        
        # Calculate budget allocation (rough split)
        total_budget = search_request.budget_max
        flight_budget = total_budget * 0.35
        hotel_budget = total_budget * 0.45
        activity_budget = total_budget * 0.20
        
        num_days = (search_request.end_date - search_request.start_date).days
        if num_days < 1:
            num_days = 1
        
        # Search flights
        flights = self.flight_service.search_flights(
            origin=search_request.origin,
            destination=destination,
            departure_date=search_request.start_date,
            return_date=search_request.end_date,
            budget_max=flight_budget,
            travelers=search_request.travelers
        )
        
        if not flights:
            return None
        
        # Search hotels
        hotels = self.hotel_service.search_hotels(
            destination=destination,
            check_in=search_request.start_date,
            check_out=search_request.end_date,
            budget_max=hotel_budget,
            travel_style=search_request.travel_style or "mid-range",
            guests=search_request.travelers
        )
        
        if not hotels:
            return None
        
        # Search activities
        activities = self.activity_service.search_activities(
            destination=destination,
            start_date=search_request.start_date,
            end_date=search_request.end_date,
            interests=search_request.interests,
            budget_max=activity_budget
        )
        
        # Score and rank options
        scored_flights = self._score_flights(flights, search_request, user_preferences)
        scored_hotels = self._score_hotels(hotels, search_request, user_preferences)
        scored_activities = self._score_activities(activities, search_request, user_preferences)
        
        # Select best options
        best_flights = [f for f, _ in sorted(scored_flights, key=lambda x: x[1], reverse=True)[:3]]
        best_hotels = [h for h, _ in sorted(scored_hotels, key=lambda x: x[1], reverse=True)[:3]]
        best_activities = [a for a, _ in sorted(scored_activities, key=lambda x: x[1], reverse=True)[:5]]
        
        if not best_flights or not best_hotels:
            return None
        
        # Calculate totals
        min_flight_price = min(f.price for f in best_flights)
        min_hotel_price = min(h.total_price for h in best_hotels)
        activities_total = sum(a.price for a in best_activities[:3])  # Top 3 activities
        
        estimated_total = min_flight_price + min_hotel_price + activities_total
        
        # Calculate match score
        match_score = self._calculate_match_score(
            flights=best_flights,
            hotels=best_hotels,
            activities=best_activities,
            search_request=search_request,
            user_preferences=user_preferences
        )
        
        return TravelRecommendation(
            destination=destination.title(),
            flights=best_flights,
            hotels=best_hotels,
            activities=best_activities,
            estimated_total=round(estimated_total, 2),
            budget_remaining=round(total_budget - estimated_total, 2),
            match_score=round(match_score, 1)
        )
    
    def _score_flights(
        self,
        flights: List[FlightOption],
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> List[Tuple[FlightOption, float]]:
        """Score flights based on preferences"""
        
        scored = []
        for flight in flights:
            score = 50  # Base score
            
            # Price score (lower is better, up to 30 points)
            budget = search_request.budget_max * 0.35
            price_ratio = flight.price / budget if budget > 0 else 1
            score += max(0, 30 * (1 - price_ratio))
            
            # Direct flight bonus (20 points)
            if flight.stops == 0:
                score += 20
            elif flight.stops == 1:
                score += 10
            
            # Reasonable departure time bonus
            dep_hour = flight.departure_time.hour
            if 8 <= dep_hour <= 18:
                score += 10
            
            scored.append((flight, score))
        
        return scored
    
    def _score_hotels(
        self,
        hotels: List[HotelOption],
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> List[Tuple[HotelOption, float]]:
        """Score hotels based on preferences"""
        
        scored = []
        for hotel in hotels:
            score = 50  # Base score
            
            # Rating score (up to 25 points)
            score += (hotel.rating / 5) * 25
            
            # Price score (value for money, up to 25 points)
            budget = search_request.budget_max * 0.45
            price_ratio = hotel.total_price / budget if budget > 0 else 1
            score += max(0, 25 * (1 - price_ratio * 0.5))
            
            # Travel style matching
            if search_request.travel_style:
                if search_request.travel_style == "luxury" and hotel.price_per_night > 300:
                    score += 15
                elif search_request.travel_style == "budget" and hotel.price_per_night < 120:
                    score += 15
                elif search_request.travel_style == "mid-range" and 100 <= hotel.price_per_night <= 250:
                    score += 15
            
            # Amenities bonus
            desired_amenities = {"Free WiFi", "Pool", "Gym"}
            matching = len(desired_amenities.intersection(set(hotel.amenities)))
            score += matching * 5
            
            scored.append((hotel, score))
        
        return scored
    
    def _score_activities(
        self,
        activities: List[ActivityOption],
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> List[Tuple[ActivityOption, float]]:
        """Score activities based on interests"""
        
        interests = set(i.lower() for i in search_request.interests) if search_request.interests else set()
        
        scored = []
        for activity in activities:
            score = 50  # Base score
            
            # Interest matching (up to 30 points)
            if activity.category.lower() in interests:
                score += 30
            elif any(interest in activity.category.lower() or interest in activity.activity_name.lower() 
                    for interest in interests):
                score += 15
            
            # Rating score (up to 20 points)
            score += (activity.rating / 5) * 20
            
            # Value score (duration vs price)
            value_ratio = activity.duration_hours / (activity.price / 50) if activity.price > 0 else 1
            score += min(15, value_ratio * 5)
            
            scored.append((activity, score))
        
        return scored
    
    def _calculate_match_score(
        self,
        flights: List[FlightOption],
        hotels: List[HotelOption],
        activities: List[ActivityOption],
        search_request: TravelSearchRequest,
        user_preferences: dict = None
    ) -> float:
        """Calculate overall match score for a recommendation"""
        
        score = 50  # Base score
        
        # Budget fit (up to 25 points)
        best_flight = min(flights, key=lambda x: x.price)
        best_hotel = min(hotels, key=lambda x: x.total_price)
        total_min = best_flight.price + best_hotel.total_price
        
        if total_min <= search_request.budget_max * 0.8:
            score += 25
        elif total_min <= search_request.budget_max:
            score += 15
        else:
            score -= 10
        
        # Interest coverage (up to 15 points)
        if search_request.interests and activities:
            interests = set(i.lower() for i in search_request.interests)
            activity_categories = set(a.category.lower() for a in activities)
            coverage = len(interests.intersection(activity_categories)) / len(interests)
            score += coverage * 15
        
        # Quality score (up to 10 points)
        if hotels:
            avg_hotel_rating = sum(h.rating for h in hotels) / len(hotels)
            score += (avg_hotel_rating / 5) * 10
        
        return min(100, max(0, score))


# Singleton instance
recommendation_engine = RecommendationEngine()
