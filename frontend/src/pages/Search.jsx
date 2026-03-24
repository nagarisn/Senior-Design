import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Plane, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAPI, itineraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchableDropdown from '../components/SearchableDropdown';
import RecommendationCard from '../components/RecommendationCard';

export default function SearchPage() {
  const { user } = useAuth();
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const [formParams, setFormParams] = useState({
    destination: '',
    origin: 'JFK',
    start_date: '',
    end_date: '',
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

  useEffect(() => {
    searchAPI.getDestinations().then(res => setDestinations(res.data)).catch(console.error);
    searchAPI.getAirports().then(res => setAirports(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const dest = urlParams.get('destination');
    if (dest) setFormParams(prev => ({ ...prev, destination: dest }));
  }, [urlParams]);

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

  const handleBook = async (recommendation) => {
    if (!user) {
      alert("Please login to book an itinerary.");
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: `Trip to ${recommendation.destination}`,
        destination: recommendation.destination,
        start_date: new Date(formParams.start_date).toISOString(),
        end_date: new Date(formParams.end_date).toISOString(),
        total_budget: recommendation.estimated_total
      };
      
      const { data: route } = await itineraryAPI.create(user.user_id, payload);
      
      // Save flights
      for (const flight of recommendation.flights) {
        await itineraryAPI.addFlight(route.id, {
          itinerary_id: route.id,
          airline: flight.airline,
          flight_number: flight.flight_number,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          price: flight.price
        });
      }
      
      // Save hotels
      for (const hotel of recommendation.hotels) {
        await itineraryAPI.addHotel(route.id, {
          itinerary_id: route.id,
          hotel_name: hotel.hotel_name,
          address: hotel.address || "City Center",
          check_in_date: payload.start_date,
          check_out_date: payload.end_date,
          room_type: hotel.room_type,
          price_per_night: hotel.price_per_night,
          total_price: hotel.total_price,
          rating: hotel.rating
        });
      }
      
      // Save activities
      for (const act of recommendation.activities) {
        await itineraryAPI.addActivity(route.id, {
          itinerary_id: route.id,
          activity_name: act.activity_name,
          description: act.description,
          location: act.location,
          scheduled_date: payload.start_date,
          duration_hours: act.duration_hours,
          price: act.price,
          category: act.category
        });
      }
      
      navigate('/itineraries');
    } catch (err) {
      console.error(err);
      setError("Booking failed. Please check the network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <h1 className="heading-xl mb-4">Craft Your <span className="text-gradient">Journey</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Fine-tune the parameters below. Our AI will align flights, luxury stays, and curated activities to perfectly match your constraints.</p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch} 
        className="glass rounded-3xl p-8 mb-12 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Destination</label>
            <SearchableDropdown
              options={destinationOptions}
              value={formParams.destination}
              onChange={(val) => setFormParams({...formParams, destination: val})}
              placeholder="Where to? (e.g. Tokyo)"
              icon={MapPin}
              displayKey="name"
              valueKey="name"
              searchKeys={["name", "country", "airport"]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Departing</label>
            <SearchableDropdown
              options={airportOptions}
              value={formParams.origin}
              onChange={(val) => setFormParams({...formParams, origin: val})}
              placeholder="Origin Airport"
              icon={Plane}
              displayKey="_display"
              valueKey="code"
              searchKeys={["city", "code", "name"]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Date Window</label>
            <div className="flex space-x-3">
              <input type="date" className="input-field cursor-pointer" value={formParams.start_date} onChange={(e) => setFormParams({...formParams, start_date: e.target.value})} required />
              <input type="date" className="input-field cursor-pointer" value={formParams.end_date} onChange={(e) => setFormParams({...formParams, end_date: e.target.value})} required />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider flex justify-between">
              <span>Budget Ceiling</span>
              <span className="text-primary-400">${formParams.budget_max.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="500" max="20000" step="500"
              className="w-full h-2 bg-surfaceLight rounded-lg appearance-none cursor-pointer accent-primary-500 mt-3"
              value={formParams.budget_max}
              onChange={(e) => setFormParams({...formParams, budget_max: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Guests</label>
              <select className="input-field" value={formParams.travelers} onChange={(e) => setFormParams({...formParams, travelers: parseInt(e.target.value)})}>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="bg-surface">{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Tier</label>
              <select className="input-field" value={formParams.travel_style} onChange={(e) => setFormParams({...formParams, travel_style: e.target.value})}>
                {styleOptions.map(style => <option key={style} value={style} className="bg-surface">{style.charAt(0).toUpperCase() + style.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 relative z-10 border-t border-white/10 pt-8">
          <label className="block text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Curated Interests</label>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map(interest => {
              const active = formParams.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    active ? 'bg-primary-500 shadow-[0_0_15px_rgba(20,184,166,0.4)] text-white' : 'glass hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 relative z-10 text-right">
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full md:w-auto px-12 py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Deep Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" /> Uncover Itineraries
              </span>
            )}
          </motion.button>
        </div>
      </motion.form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center">
            {error}
          </motion.div>
        )}

        {results && results.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="heading-lg border-b border-white/10 pb-4">
              <span className="text-primary-400">{results.recommendations.length}</span> Masterpieces Generated
            </h2>
            <div className="flex flex-col gap-8">
              {results.recommendations.map((rec, index) => (
                <RecommendationCard 
                  key={index} 
                  recommendation={rec} 
                  user={user} 
                  onBook={() => handleBook(rec)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
