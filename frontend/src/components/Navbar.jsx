import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, User, Menu, X, Heart, Map, Bell as BellIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl shadow-lg"
              >
                <Plane className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-display font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">
                Smart<span className="text-primary-500">Travel</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-slate-300 hover:text-white font-medium transition-colors">Explore</Link>
            {user && (
              <>
                <Link to="/itineraries" className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-2">
                  <Map className="w-4 h-4" /> My Trips
                </Link>
                <Link to="/favorites" className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Favorites
                </Link>
                <Link to="/alerts" className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-2">
                  <BellIcon className="w-4 h-4" /> Alerts
                </Link>
              </>
            )}

            <div className="h-8 w-px bg-white/20"></div>

            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <Link to="/profile" className="flex items-center space-x-2 text-slate-200 hover:text-white transition-colors group">
                  <div className="bg-surfaceLight p-2 rounded-full group-hover:bg-primary-500/20 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button onClick={logout} className="btn-secondary text-sm px-4 py-2">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">Sign In</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/search" className="block py-3 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>Explore</Link>
              {user && (
                <>
                  <Link to="/itineraries" className="block py-3 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>My Trips</Link>
                  <Link to="/favorites" className="block py-3 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                  <Link to="/alerts" className="block py-3 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
                  <Link to="/profile" className="block py-3 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left py-3 px-4 rounded-xl text-red-400 hover:bg-white/10">Logout</button>
                </>
              )}
              {!user && (
                <Link to="/login" className="block py-3 px-4 rounded-xl bg-primary-600 text-white text-center mt-4" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
