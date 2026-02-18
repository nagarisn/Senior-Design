#!/bin/bash
echo "========================================="
echo "  SMART TRAVEL - END-TO-END TEST SUITE"
echo "========================================="
echo ""

PASS=0
FAIL=0

check() {
  local name="$1"
  local result="$2"
  local expected="$3"
  if echo "$result" | grep -q "$expected"; then
    echo "  PASS: $name"
    PASS=$((PASS+1))
  else
    echo "  FAIL: $name"
    echo "    Expected to find: $expected"
    echo "    Got: $(echo $result | head -c 200)"
    FAIL=$((FAIL+1))
  fi
}

check_status() {
  local name="$1"
  local status="$2"
  local expected="$3"
  if [ "$status" = "$expected" ]; then
    echo "  PASS: $name"
    PASS=$((PASS+1))
  else
    echo "  FAIL: $name (expected $expected, got $status)"
    FAIL=$((FAIL+1))
  fi
}

BASE="http://localhost:8000"
FRONTEND="http://localhost:3000"

# 1. Health Check
R=$(curl -s $BASE/health)
check "Health Check" "$R" "healthy"

# 2. Register User
R=$(curl -s -X POST $BASE/api/users/register -H "Content-Type: application/json" -d '{"email":"test@test.com","name":"Test User","password":"pass123"}')
check "Register User" "$R" "test@test.com"

# 3. Duplicate Registration
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/users/register -H "Content-Type: application/json" -d '{"email":"test@test.com","name":"Test User","password":"pass123"}')
check_status "Duplicate Registration Rejected" "$S" "400"

# 4. Login
R=$(curl -s -X POST $BASE/api/users/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"pass123"}')
check "Login" "$R" "Login successful"

# 5. Wrong Password
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/users/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}')
check_status "Wrong Password Rejected" "$S" "401"

# 6. Get User
R=$(curl -s $BASE/api/users/1)
check "Get User Details" "$R" "Test User"

# 7. Get Preferences
R=$(curl -s $BASE/api/users/1/preferences)
check "Get Default Preferences" "$R" "user_id"

# 8. Update Preferences
R=$(curl -s -X PUT $BASE/api/users/1/preferences -H "Content-Type: application/json" -d '{"preferred_budget_min":2000,"preferred_budget_max":8000,"preferred_activities":["adventure","culture"],"preferred_travel_style":"mid-range"}')
check "Update Preferences" "$R" "preferred_budget_max"

# 9. Get Destinations
R=$(curl -s $BASE/api/destinations)
check "Get Popular Destinations" "$R" "Paris"

# 10. Search Travel
R=$(curl -s -X POST $BASE/api/search -H "Content-Type: application/json" -d '{"destination":"paris","origin":"JFK","start_date":"2026-06-15T00:00:00","end_date":"2026-06-22T00:00:00","budget_max":5000,"travelers":1,"interests":["culture","food"],"travel_style":"mid-range"}')
check "Search Travel" "$R" "recommendations"

# 11. Personalized Search
R=$(curl -s -X POST $BASE/api/search/user/1 -H "Content-Type: application/json" -d '{"destination":"tokyo","origin":"LAX","start_date":"2026-07-01T00:00:00","end_date":"2026-07-10T00:00:00","budget_max":10000,"travelers":2}')
check "Personalized Search" "$R" "recommendations"

# 12. Create Itinerary
R=$(curl -s -X POST "$BASE/api/itineraries?user_id=1" -H "Content-Type: application/json" -d '{"name":"Tokyo Trip","destination":"Tokyo","start_date":"2026-07-01T00:00:00","end_date":"2026-07-10T00:00:00","total_budget":10000}')
check "Create Itinerary" "$R" "Tokyo Trip"

# 13. Add Flight
R=$(curl -s -X POST $BASE/api/itineraries/1/flights -H "Content-Type: application/json" -d '{"itinerary_id":1,"airline":"United","flight_number":"UA789","departure_airport":"LAX","arrival_airport":"NRT","departure_time":"2026-07-01T10:00:00","arrival_time":"2026-07-02T14:00:00","price":1200}')
check "Add Flight" "$R" "UA789"

# 14. Add Hotel
R=$(curl -s -X POST $BASE/api/itineraries/1/hotels -H "Content-Type: application/json" -d '{"itinerary_id":1,"hotel_name":"Hilton Tokyo","address":"Shinjuku","check_in_date":"2026-07-02T00:00:00","check_out_date":"2026-07-10T00:00:00","room_type":"King","price_per_night":200,"total_price":1600,"rating":4.5}')
check "Add Hotel" "$R" "Hilton Tokyo"

# 15. Add Activity
R=$(curl -s -X POST $BASE/api/itineraries/1/activities -H "Content-Type: application/json" -d '{"itinerary_id":1,"activity_name":"Fuji Trip","description":"Day trip","location":"Tokyo","scheduled_date":"2026-07-05T08:00:00","duration_hours":10,"price":150,"category":"adventure"}')
check "Add Activity" "$R" "Fuji Trip"

# 16. Get Itinerary with Bookings
R=$(curl -s $BASE/api/itineraries/1)
check "Get Itinerary (has flight)" "$R" "UA789"
check "Get Itinerary (has hotel)" "$R" "Hilton Tokyo"
check "Get Itinerary (has activity)" "$R" "Fuji Trip"

# 17. Get User Itineraries
R=$(curl -s $BASE/api/itineraries/user/1)
check "Get User Itineraries" "$R" "Tokyo Trip"

# 18. Update Status
R=$(curl -s -X PUT "$BASE/api/itineraries/1/status?status=confirmed")
check "Update Itinerary Status" "$R" "confirmed"

# 19. Add Favorite
R=$(curl -s -X POST $BASE/api/users/1/favorites -H "Content-Type: application/json" -d '{"destination_name":"Bali","country":"Indonesia","notes":"Dream spot"}')
check "Add Favorite" "$R" "Bali"

# 20. Get Favorites
R=$(curl -s $BASE/api/users/1/favorites)
check "Get Favorites" "$R" "Bali"

# 21. Remove Favorite
R=$(curl -s -X DELETE $BASE/api/users/1/favorites/1)
check "Remove Favorite" "$R" "Favorite removed"

# 22. Delete Itinerary
R=$(curl -s -X DELETE $BASE/api/itineraries/1)
check "Delete Itinerary" "$R" "Itinerary deleted"

# 23. Frontend HTML
R=$(curl -s $FRONTEND/)
check "Frontend Serves HTML" "$R" "Smart Travel"

# 24. Frontend API Proxy
R=$(curl -s $FRONTEND/api/destinations)
check "Frontend API Proxy" "$R" "Paris"

echo ""
echo "========================================="
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "  Total: $((PASS+FAIL)) tests"
echo "========================================="
