import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, LogIn, UserPlus } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
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
        login(response.data);
        navigate('/search');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="glass-card w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h2 className="heading-md">
            {isRegister ? 'Join ' : 'Welcome to '}
            <span className="text-primary-400">SmartTravel</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            {isRegister ? 'Create your profile to start planning' : 'Log in to access your luxury itineraries'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm flex items-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="E.g. James Bond"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Secure Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full flex justify-center items-center py-3.5 mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? <><UserPlus className="w-5 h-5 mr-2"/> Create Account</> : <><LogIn className="w-5 h-5 mr-2"/> Enter Portal</>}
          </motion.button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium focus:outline-none"
          >
            {isRegister ? 'Already have credentials? Log in' : "First time? Apply for access"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
