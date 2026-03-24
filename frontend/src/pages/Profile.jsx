import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Shield, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
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
      // Small visual feedback without annoying alert
      const btn = document.getElementById('save-btn');
      btn.innerText = 'Saved Successfully!';
      btn.classList.add('bg-green-600');
      setTimeout(() => {
        btn.innerText = 'Save Profile Parameters';
        btn.classList.remove('bg-green-600');
      }, 2000);
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center max-w-md w-full p-10">
          <User className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h2 className="heading-md mb-4 text-white">Access Denied</h2>
          <Link to="/login" className="btn-primary w-full inline-block">Secure Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 pl-2 border-l-4 border-primary-500">
        <h1 className="heading-xl text-white">Command <span className="text-primary-400">Center</span></h1>
        <p className="text-slate-400 mt-2">Manage your identity and algorithmic preferences.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
          <div className="glass-card text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.2)]">
              <span className="text-4xl font-display font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-primary-400 text-sm font-medium mb-6">{user.email}</p>
            <div className="h-px w-full bg-white/10 mb-6"></div>
            <div className="flex flex-col space-y-3">
              <button className="flex items-center text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-lg text-sm font-medium">
                <Settings className="w-4 h-4 mr-3 text-slate-400" /> Account Settings
              </button>
              <button className="flex items-center text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-lg text-sm font-medium">
                <Bell className="w-4 h-4 mr-3 text-slate-400" /> Notifications
              </button>
              <button className="flex items-center text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-lg text-sm font-medium">
                <Shield className="w-4 h-4 mr-3 text-slate-400" /> Security & Privacy
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <div className="glass-card">
            <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
              <h2 className="heading-md text-white">Algorithmic Baseline</h2>
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">AI Tuned</span>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-10 bg-surfaceLight/50 rounded-lg"></div>
                <div className="h-10 bg-surfaceLight/50 rounded-lg"></div>
                <div className="h-20 bg-surfaceLight/50 rounded-lg"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Budget Range */}
                <div>
                  <label className="flex justify-between text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                    <span>Default Budget Ceiling</span>
                    <span className="text-white">${preferences.preferred_budget_max || 5000}</span>
                  </label>
                  <input
                    type="range"
                    min="1000" max="20000" step="500"
                    className="w-full h-2 bg-surfaceLight rounded-lg appearance-none cursor-pointer accent-primary-500"
                    value={preferences.preferred_budget_max || 5000}
                    onChange={(e) => setPreferences({...preferences, preferred_budget_max: parseInt(e.target.value)})}
                  />
                </div>

                {/* Travel Style */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Default Luxury Tier</label>
                  <select
                    className="input-field"
                    value={preferences.preferred_travel_style || 'mid-range'}
                    onChange={(e) => setPreferences({...preferences, preferred_travel_style: e.target.value})}
                  >
                    <option value="budget" className="bg-surface">Budget Expeditions</option>
                    <option value="mid-range" className="bg-surface">Mid-Range Comfort</option>
                    <option value="luxury" className="bg-surface">Uncompromised Luxury</option>
                  </select>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Core Interests</label>
                  <div className="flex flex-wrap gap-3">
                    {interestOptions.map(interest => {
                      const active = preferences.preferred_activities?.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleActivity(interest)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            active ? 'bg-primary-500 shadow-[0_0_15px_rgba(20,184,166,0.3)] text-white' : 'glass hover:bg-white/10 text-slate-400'
                          }`}
                        >
                          {interest.charAt(0).toUpperCase() + interest.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">These interests are baked into the AI recommendations for all your future searches automatically.</p>
                </div>

                <div className="pt-6 border-t border-white/10 text-right">
                  <motion.button 
                    id="save-btn"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={savePreferences} 
                    disabled={saving} 
                    className="btn-primary"
                  >
                    {saving ? 'Syncing...' : 'Save Profile Parameters'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
