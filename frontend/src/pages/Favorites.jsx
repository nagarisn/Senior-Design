import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
  const { user } = useAuth();
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card text-center max-w-md w-full p-10">
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-accent-400 fill-current" />
          </div>
          <h2 className="heading-md mb-4 text-white">Access Denied</h2>
          <p className="text-slate-400 mb-8">Log in to view your wishlisted destinations.</p>
          <Link to="/login" className="btn-primary w-full inline-block">Secure Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 border-b border-white/10 pb-6">
        <h1 className="heading-xl mb-2 text-white">Your <span className="text-accent-400">Favorites</span></h1>
        <p className="text-slate-400 text-lg">Destinations you've marked for future exploration.</p>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 glass-card animate-pulse bg-surfaceLight/50"></div>)}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20 px-4 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Heart className="h-10 w-10 text-slate-600" />
          </div>
          <h3 className="heading-md mb-3 text-white">No Saved Destinations</h3>
          <p className="text-slate-400 mb-8 text-lg">Browse the globe and save places that catch your eye.</p>
          <Link to="/" className="btn-primary px-8">Explore the World</Link>
        </motion.div>
      ) : (
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {favorites.map(favorite => (
              <motion.div 
                key={favorite.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
                className="glass-card relative overflow-hidden group p-0 flex flex-col"
              >
                <div className="h-40 bg-gradient-to-br from-surfaceLight to-surface relative">
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-red-400 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-display font-bold text-white drop-shadow-md">{favorite.destination_name}</h3>
                    {favorite.country && (
                      <div className="flex items-center text-accent-400 text-sm font-semibold mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> {favorite.country}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {favorite.notes ? (
                    <p className="text-sm text-slate-400 italic mb-6">"{favorite.notes}"</p>
                  ) : (
                    <p className="text-sm text-slate-500 mb-6">Ready to plan a trip here?</p>
                  )}
                  
                  <Link
                    to={`/search?destination=${favorite.destination_name}`}
                    className="mt-auto w-full py-2.5 bg-accent-600/20 hover:bg-accent-600/40 text-accent-300 font-medium rounded-xl transition-colors border border-accent-500/20 flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Plan Journey
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
