import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SearchableDropdown from '../components/SearchableDropdown';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ destination: '', target_price: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      userAPI.getAlerts(user.user_id),
      searchAPI.getDestinations()
    ]).then(([alertsRes, destRes]) => {
      setAlerts(alertsRes.data);
      setDestinations(destRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card text-center p-10 max-w-md">
          <Bell className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="heading-md text-white mb-3">Sign In Required</h2>
          <p className="text-slate-400 mb-6">Log in to manage your price alerts.</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.target_price) return;
    setCreating(true);
    try {
      const res = await userAPI.createAlert(user.user_id, {
        destination: form.destination,
        target_price: parseFloat(form.target_price)
      });
      setAlerts(prev => [res.data, ...prev]);
      setForm({ destination: '', target_price: '' });
      setShowForm(false);
    } catch { alert('Failed to create alert.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    await userAPI.deleteAlert(user.user_id, alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const destinationOptions = destinations.map(d => ({
    ...d,
    _subtitle: `${d.airport} - ${d.country}`
  }));

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="heading-xl text-white mb-2">Price <span className="text-primary-400">Alerts</span></h1>
          <p className="text-slate-400">Get notified when destination prices drop to your target.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary mt-4 md:mt-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card mb-8 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white mb-5">Create Price Alert</h3>
            <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Destination</label>
                <SearchableDropdown
                  options={destinationOptions}
                  value={form.destination}
                  onChange={(val) => setForm(f => ({ ...f, destination: val }))}
                  placeholder="Select destination"
                  icon={MapPin}
                  displayKey="name"
                  valueKey="name"
                  searchKeys={["name", "country", "airport"]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Target Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    className="input-field pl-9"
                    placeholder="e.g. 500"
                    value={form.target_price}
                    onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={creating} className="btn-primary h-11">
                {creating ? 'Creating...' : 'Create Alert'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 glass-card animate-pulse"></div>)}
        </div>
      ) : alerts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-16">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="heading-md text-white mb-2">No Alerts Yet</h3>
          <p className="text-slate-400 mb-6">Create an alert to get notified when prices drop.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create First Alert</button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          className="space-y-4"
        >
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="glass-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="font-bold text-white">{alert.destination}</div>
                  <div className="text-sm text-slate-400">
                    Target: <span className="text-primary-400 font-semibold">${alert.target_price.toLocaleString()}</span>
                    {alert.current_price && (
                      <span className="ml-3">
                        Current: <span className={`font-semibold ${alert.current_price <= alert.target_price ? 'text-green-400' : 'text-slate-300'}`}>
                          ${alert.current_price.toLocaleString()}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  alert.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}>
                  {alert.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
