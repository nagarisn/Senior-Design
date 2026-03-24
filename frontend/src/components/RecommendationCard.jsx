import React, { useState } from 'react';
import { Plane, Hotel, MapPin, Star, ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecommendationCard({ recommendation, user, onBook }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-6 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="heading-md">{recommendation.destination}</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {recommendation.match_score}% Match
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-slate-300">
              Total: <span className="font-bold text-white">${recommendation.estimated_total.toLocaleString()}</span>
            </span>
            {recommendation.budget_remaining > 0 && (
              <span className="text-green-400 font-medium flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                ${recommendation.budget_remaining.toLocaleString()} under budget
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-accent px-6"
            onClick={onBook}
          >
            Book Now
          </motion.button>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center p-3 rounded-xl bg-surfaceLight hover:bg-slate-600 transition-colors text-white"
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 mt-6 pt-6 space-y-8"
          >
            {/* Flights */}
            <div>
              <h4 className="flex items-center text-lg font-semibold mb-4 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Plane className="h-5 w-5 text-blue-400" />
                </div>
                Flight Options
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation.flights.map((flight, idx) => (
                  <div key={idx} className="bg-surface/50 border border-white/5 rounded-xl p-5 hover:border-blue-500/50 hover:bg-surface transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white">{flight.airline}</div>
                      <span className="text-sm font-medium text-slate-400">{flight.flight_number}</span>
                    </div>
                    <div className="text-sm text-slate-300 mb-4 flex items-center justify-between">
                      <span>{flight.departure_airport}</span>
                      <div className="flex-1 border-t border-dashed border-slate-600 mx-3 relative">
                        <Plane className="w-3 h-3 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span>{flight.arrival_airport}</span>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/5">
                      <span className="text-xl font-bold text-blue-400">${flight.price}</span>
                      <span className="text-xs font-semibold px-2 py-1 bg-white/5 rounded-md text-slate-300">
                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotels */}
            <div>
              <h4 className="flex items-center text-lg font-semibold mb-4 text-white">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Hotel className="h-5 w-5 text-purple-400" />
                </div>
                Luxury Stays
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation.hotels.map((hotel, idx) => (
                  <div key={idx} className="bg-surface/50 border border-white/5 rounded-xl p-5 hover:border-purple-500/50 hover:bg-surface transition-all">
                    <div className="font-bold text-white mb-1 line-clamp-1">{hotel.hotel_name}</div>
                    <div className="flex items-center text-sm text-slate-300 mb-3">
                      <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                      <span className="font-medium mr-2">{hotel.rating}</span>
                      <span className="text-slate-500 truncate">{hotel.room_type}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {hotel.amenities?.slice(0,3).map((am, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-400">{am}</span>
                      ))}
                      {hotel.amenities?.length > 3 && <span className="text-[10px] px-2 py-0.5 text-slate-500">+{hotel.amenities.length - 3}</span>}
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/5">
                      <span className="text-xl font-bold text-purple-400">${hotel.total_price}</span>
                      <span className="text-xs text-slate-400 font-medium">${hotel.price_per_night}/night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h4 className="flex items-center text-lg font-semibold mb-4 text-white">
                <div className="p-2 bg-accent-500/20 rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-accent-400" />
                </div>
                Curated Experiences
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation.activities.map((activity, idx) => (
                  <div key={idx} className="bg-surface/50 border border-white/5 rounded-xl p-5 hover:border-accent-500/50 hover:bg-surface transition-all flex flex-col h-full">
                    <div className="font-bold text-white mb-1">{activity.activity_name}</div>
                    <div className="inline-block px-2 py-0.5 bg-accent-500/10 rounded text-xs font-semibold text-accent-400 w-max mb-3 uppercase tracking-wider">
                      {activity.category}
                    </div>
                    <div className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                      {activity.description}
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5">
                      <span className="text-xl font-bold text-accent-400">${activity.price}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-300">{activity.duration_hours}h</span>
                        <div className="flex items-center text-xs font-medium text-slate-300 border-l border-white/10 pl-3">
                          <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                          {activity.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
