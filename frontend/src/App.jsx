import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plane, Hotel, MapPin, Calendar, DollarSign, User, Heart, Menu, X, Search, Star, ChevronDown } from 'lucide-react';
import { searchAPI, userAPI, itineraryAPI } from './services/api';

// ============== Navigation Component ==============
function Navbar({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Smart Travel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/search" className="text-gray-700 hover:text-primary-600 transition-colors">Search</Link>
            {user && (
              <>
                <Link to="/itineraries" className="text-gray-700 hover:text-primary-600 transition-colors">My Trips</Link>
                <Link to="/favorites" className="text-gray-700 hover:text-primary-600 transition-colors">Favorites</Link>
              </>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">Login</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link to="/" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/search" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Search</Link>
            {user && (
              <>
                <Link to="/itineraries" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>My Trips</Link>
                <Link to="/favorites" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ============== Home Page ==============
function HomePage() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    searchAPI.getDestinations().then(res => setDestinations(res.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Plan Your Perfect Vacation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              AI-powered travel planning that fits your budget, dates, and interests
            </p>
            <Link to="/search" className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              <Search className="mr-2 h-5 w-5" />
              Start Planning
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Your Preferences</h3>
              <p className="text-gray-600">Set your budget, dates, and interests to get personalized recommendations</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Finds Best Options</h3>
              <p className="text-gray-600">Our intelligent system compares flights, hotels, and activities for you</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Your Trip</h3>
              <p className="text-gray-600">Review your personalized itinerary and book everything in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Destinations</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {destinations.slice(0, 8).map((dest, index) => (
              <Link
                key={index}
                to={`/search?destination=${dest.name}`}
                className="group relative overflow-hidden rounded-xl h-48 transition-all hover:shadow-xl"
              >
                {dest.image ? (
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <h3 className="text-xl font-bold drop-shadow-lg">{dest.name}</h3>
                  <p className="text-sm text-gray-200 drop-shadow">{dest.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============== Searchable Dropdown Component ==============
function SearchableDropdown({ options, value, onChange, placeholder, icon: Icon, displayKey, valueKey, searchKeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync the text input when value changes externally (e.g. from URL params)
  useEffect(() => {
    if (value && !isOpen) {
      const match = options.find(o => o[valueKey] === value);
      if (match) setQuery(match[displayKey]);
      else setQuery(value);
    }
  }, [value, options]);

  const filtered = options.filter(o =>
    searchKeys.some(k => o[k]?.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setQuery(option[displayKey]);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />}
        <input
          type="text"
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-10' : ''} pr-10`}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
              onClick={() => handleSelect(option)}
            >
              <div className="font-medium text-gray-900">{option[displayKey]}</div>
              {option._subtitle && <div className="text-sm text-gray-500">{option._subtitle}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Search Page ==============
function SearchPage({ user }) {
  const [urlParams] = useSearchParams();
  const [formParams, setFormParams] = useState({
    destination: '',
    origin: 'JFK',
    start_date: '',
    end_date: '',
    budget_min: 0,
    budget_max: 5000,
    travelers: 1,
    interests: [],
    travel_style: 'mid-range'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [airports, setAirports] = useState([]);

  const interestOptions = ['adventure', 'culture', 'relaxation', 'food', 'nightlife'];
  const styleOptions = ['budget', 'mid-range', 'luxury'];

  // Load dropdown data
  useEffect(() => {
    searchAPI.getDestinations().then(res => setDestinations(res.data)).catch(console.error);
    searchAPI.getAirports().then(res => setAirports(res.data)).catch(console.error);
  }, []);

  // Read destination from URL query param
  useEffect(() => {
    const dest = urlParams.get('destination');
    if (dest) {
      setFormParams(prev => ({ ...prev, destination: dest }));
    }
  }, [urlParams]);

  // Prepare dropdown options with subtitles
  const destinationOptions = destinations.map(d => ({
    ...d,
    _subtitle: `${d.airport} - ${d.country}`,
  }));

  const airportOptions = airports.map(a => ({
    ...a,
    _subtitle: `${a.code} - ${a.name}`,
    _display: `${a.city} (${a.code})`,
  }));

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...formParams,
        start_date: new Date(formParams.start_date).toISOString(),
        end_date: new Date(formParams.end_date).toISOString(),
      };

      const response = user
        ? await searchAPI.searchPersonalized(user.user_id, params)
        : await searchAPI.search(params);

      setResults(response.data);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormParams(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Trip</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="card mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Destination Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <SearchableDropdown
                options={destinationOptions}
                value={formParams.destination}
                onChange={(val) => setFormParams({...formParams, destination: val})}
                placeholder="Where to? (e.g., Paris, Tokyo)"
                icon={MapPin}
                displayKey="name"
                valueKey="name"
                searchKeys={["name", "country", "airport"]}
              />
            </div>

            {/* Origin Airport Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departing From</label>
              <SearchableDropdown
                options={airportOptions}
                value={formParams.origin}
                onChange={(val) => setFormParams({...formParams, origin: val})}
                placeholder="Select departure airport"
                icon={Plane}
                displayKey="_display"
                valueKey="code"
                searchKeys={["city", "code", "name"]}
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Dates</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="input-field"
                  value={formParams.start_date}
                  onChange={(e) => setFormParams({...formParams, start_date: e.target.value})}
                  required
                />
                <input
                  type="date"
                  className="input-field"
                  value={formParams.end_date}
                  onChange={(e) => setFormParams({...formParams, end_date: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget: ${formParams.budget_max.toLocaleString()}
              </label>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                value={formParams.budget_max}
                onChange={(e) => setFormParams({...formParams, budget_max: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$500</span>
                <span>$20,000</span>
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
              <select
                className="input-field"
                value={formParams.travelers}
                onChange={(e) => setFormParams({...formParams, travelers: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                ))}
              </select>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
              <select
                className="input-field"
                value={formParams.travel_style}
                onChange={(e) => setFormParams({...formParams, travel_style: e.target.value})}
              >
                {styleOptions.map(style => (
                  <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formParams.interests.includes(interest)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full md:w-auto">
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Searching...
              </span>
            ) : 'Search Trips'}
          </button>
        </form>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">{error}</div>}

        {/* Results */}
        {results && results.recommendations && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {results.recommendations.length} Recommendations Found
            </h2>
            {results.recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Recommendation Card Component ==============
function RecommendationCard({ recommendation, user }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{recommendation.destination}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Star className="h-4 w-4 mr-1" />
              {recommendation.match_score}% Match
            </span>
            <span className="text-gray-600">
              Estimated: <span className="font-semibold">${recommendation.estimated_total.toLocaleString()}</span>
            </span>
            {recommendation.budget_remaining > 0 && (
              <span className="text-green-600">
                ${recommendation.budget_remaining.toLocaleString()} under budget
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-primary mt-4 md:mt-0"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {expanded && (
        <div className="border-t pt-6 space-y-6">
          {/* Flights */}
          <div>
            <h4 className="flex items-center text-lg font-semibold mb-3">
              <Plane className="h-5 w-5 mr-2 text-primary-600" />
              Flights
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.flights.map((flight, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
                  <div className="font-semibold">{flight.airline}</div>
                  <div className="text-sm text-gray-600">{flight.flight_number}</div>
                  <div className="text-sm mt-2">
                    {flight.departure_airport} → {flight.arrival_airport}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-primary-600">${flight.price}</span>
                    <span className="text-sm text-gray-500">
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotels */}
          <div>
            <h4 className="flex items-center text-lg font-semibold mb-3">
              <Hotel className="h-5 w-5 mr-2 text-primary-600" />
              Hotels
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.hotels.map((hotel, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
                  <div className="font-semibold">{hotel.hotel_name}</div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {hotel.rating}
                  </div>
                  <div className="text-sm mt-2">{hotel.room_type}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-primary-600">${hotel.total_price}</span>
                    <span className="text-sm text-gray-500">${hotel.price_per_night}/night</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <h4 className="flex items-center text-lg font-semibold mb-3">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              Activities
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.activities.map((activity, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
                  <div className="font-semibold">{activity.activity_name}</div>
                  <div className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mt-1">
                    {activity.category}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{activity.duration_hours}h duration</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-primary-600">${activity.price}</span>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {activity.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Login Page ==============
function LoginPage({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await userAPI.register(formData);
        setIsRegister(false);
        setError(null);
        alert('Registration successful! Please login.');
      } else {
        const response = await userAPI.login({
          email: formData.email,
          password: formData.password
        });
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={isRegister}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary-600 hover:underline"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== Itineraries Page ==============
function ItinerariesPage({ user }) {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      itineraryAPI.getUserItineraries(user.user_id)
        .then(res => setItineraries(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view your trips</h2>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : itineraries.length === 0 ? (
          <div className="card text-center py-12">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
            <Link to="/search" className="btn-primary">Search Trips</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(itinerary => (
              <div key={itinerary.id} className="card">
                <h3 className="text-xl font-semibold">{itinerary.name}</h3>
                <p className="text-gray-600">{itinerary.destination}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Budget: ${itinerary.total_budget}
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    itinerary.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    itinerary.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Favorites Page ==============
function FavoritesPage({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      userAPI.getFavorites(user.user_id)
        .then(res => setFavorites(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const removeFavorite = async (favoriteId) => {
    try {
      await userAPI.removeFavorite(user.user_id, favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view favorites</h2>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Favorite Destinations</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : favorites.length === 0 ? (
          <div className="card text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-600">Save destinations you love for quick access</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(favorite => (
              <div key={favorite.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{favorite.destination_name}</h3>
                    {favorite.country && <p className="text-gray-600">{favorite.country}</p>}
                  </div>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Heart className="h-6 w-6 fill-current" />
                  </button>
                </div>
                {favorite.notes && <p className="mt-2 text-sm text-gray-600">{favorite.notes}</p>}
                <Link
                  to={`/search?destination=${favorite.destination_name}`}
                  className="btn-primary mt-4 inline-block text-sm"
                >
                  Plan a Trip
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Profile Page ==============
function ProfilePage({ user }) {
  const [preferences, setPreferences] = useState({
    preferred_budget_min: 0,
    preferred_budget_max: 5000,
    preferred_activities: [],
    preferred_travel_style: 'mid-range'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const interestOptions = ['adventure', 'culture', 'relaxation', 'food', 'nightlife'];

  useEffect(() => {
    if (user) {
      userAPI.getPreferences(user.user_id)
        .then(res => setPreferences(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const savePreferences = async () => {
    setSaving(true);
    try {
      await userAPI.updatePreferences(user.user_id, preferences);
      alert('Preferences saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActivity = (activity) => {
    setPreferences(prev => ({
      ...prev,
      preferred_activities: prev.preferred_activities?.includes(activity)
        ? prev.preferred_activities.filter(a => a !== activity)
        : [...(prev.preferred_activities || []), activity]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login</h2>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Profile & Preferences</h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Info</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Travel Preferences</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range: ${preferences.preferred_budget_min || 0} - ${preferences.preferred_budget_max || 5000}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  className="w-full"
                  value={preferences.preferred_budget_max || 5000}
                  onChange={(e) => setPreferences({...preferences, preferred_budget_max: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                <select
                  className="input-field"
                  value={preferences.preferred_travel_style || 'mid-range'}
                  onChange={(e) => setPreferences({...preferences, preferred_travel_style: e.target.value})}
                >
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-Range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleActivity(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        preferences.preferred_activities?.includes(interest)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={savePreferences} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Main App Component ==============
function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/itineraries" element={<ItinerariesPage user={user} />} />
          <Route path="/favorites" element={<FavoritesPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
