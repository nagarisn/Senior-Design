import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plane, Hotel, MapPin, Calendar, DollarSign, Star, Trash2, Download, ArrowLeft, Edit2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { itineraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CheckoutSimulation from '../components/CheckoutSimulation';

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    itineraryAPI.getItinerary(id)
      .then(res => {
        setItinerary(res.data);
        setEditForm({ name: res.data.name, total_budget: res.data.total_budget });
      })
      .catch(() => setError('Could not load itinerary.'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await itineraryAPI.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartTravel_Itinerary_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('PDF download failed.'); }
    finally { setPdfLoading(false); }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await itineraryAPI.update(id, editForm);
      setItinerary(res.data);
      setEditing(false);
    } catch { alert('Update failed.'); }
  };

  const handleRemoveFlight = async (flightId) => {
    if (!window.confirm('Remove this flight?')) return;
    await itineraryAPI.removeFlight(id, flightId);
    setItinerary(prev => ({ ...prev, flights: prev.flights.filter(f => f.id !== flightId) }));
  };

  const handleRemoveHotel = async (hotelId) => {
    if (!window.confirm('Remove this hotel?')) return;
    await itineraryAPI.removeHotel(id, hotelId);
    setItinerary(prev => ({ ...prev, hotels: prev.hotels.filter(h => h.id !== hotelId) }));
  };

  const handleRemoveActivity = async (activityId) => {
    if (!window.confirm('Remove this activity?')) return;
    await itineraryAPI.removeActivity(id, activityId);
    setItinerary(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== activityId) }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !itinerary) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card text-center p-10">
        <p className="text-red-400 mb-4">{error || 'Itinerary not found.'}</p>
        <Link to="/itineraries" className="btn-primary">Back to Itineraries</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/itineraries" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors w-max">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Itineraries
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-3">
                <input
                  className="input-field text-2xl font-bold"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
                <button onClick={handleSaveEdit} className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg"><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditing(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{itinerary.name}</h1>
                <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span className="text-primary-400 font-semibold uppercase tracking-wide text-sm">{itinerary.destination}</span>
              <span className={`ml-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                itinerary.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                itinerary.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>{itinerary.status}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {pdfLoading ? 'Generating...' : 'PDF'}
            </button>
            {itinerary.status !== 'confirmed' && (
              <button
                onClick={() => setCheckoutOpen(true)}
                className="btn-primary px-5 py-2.5"
              >
                Complete Booking
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center text-slate-400 mb-1"><Calendar className="w-4 h-4 mr-2" /><span className="text-xs uppercase tracking-wide">Dates</span></div>
            <div className="text-white font-medium text-sm">
              {new Date(itinerary.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(itinerary.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center text-slate-400 mb-1"><DollarSign className="w-4 h-4 mr-2" /><span className="text-xs uppercase tracking-wide">Budget</span></div>
            {editing ? (
              <input type="number" className="input-field py-1 text-sm" value={editForm.total_budget} onChange={e => setEditForm(f => ({ ...f, total_budget: parseFloat(e.target.value) }))} />
            ) : (
              <div className="text-white font-bold">${itinerary.total_budget.toLocaleString()}</div>
            )}
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center text-slate-400 mb-1"><Plane className="w-4 h-4 mr-2" /><span className="text-xs uppercase tracking-wide">Items</span></div>
            <div className="text-white font-medium text-sm">{itinerary.flights.length}F · {itinerary.hotels.length}H · {itinerary.activities.length}A</div>
          </div>
        </div>
      </motion.div>

      {/* Flights */}
      <Section title="Flights" icon={<Plane className="w-5 h-5 text-blue-400" />} color="blue">
        {itinerary.flights.length === 0 ? (
          <p className="text-slate-500 text-sm">No flights booked.</p>
        ) : itinerary.flights.map(f => (
          <ItemCard key={f.id} onRemove={() => handleRemoveFlight(f.id)}>
            <div className="font-bold text-white">{f.airline}</div>
            <div className="text-sm text-slate-400">{f.flight_number} · {f.departure_airport} → {f.arrival_airport}</div>
            <div className="text-blue-400 font-bold mt-1">${f.price.toLocaleString()}</div>
          </ItemCard>
        ))}
      </Section>

      {/* Hotels */}
      <Section title="Accommodation" icon={<Hotel className="w-5 h-5 text-purple-400" />} color="purple">
        {itinerary.hotels.length === 0 ? (
          <p className="text-slate-500 text-sm">No hotels booked.</p>
        ) : itinerary.hotels.map(h => (
          <ItemCard key={h.id} onRemove={() => handleRemoveHotel(h.id)}>
            <div className="font-bold text-white">{h.hotel_name}</div>
            <div className="flex items-center text-sm text-slate-400 mt-0.5">
              <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />{h.rating} · {h.room_type}
            </div>
            <div className="text-purple-400 font-bold mt-1">${h.total_price.toLocaleString()} total</div>
          </ItemCard>
        ))}
      </Section>

      {/* Activities */}
      <Section title="Activities" icon={<MapPin className="w-5 h-5 text-orange-400" />} color="orange">
        {itinerary.activities.length === 0 ? (
          <p className="text-slate-500 text-sm">No activities booked.</p>
        ) : itinerary.activities.map(a => (
          <ItemCard key={a.id} onRemove={() => handleRemoveActivity(a.id)}>
            <div className="font-bold text-white">{a.activity_name}</div>
            <div className="text-sm text-slate-400">{a.category} · {a.duration_hours}h</div>
            <div className="text-orange-400 font-bold mt-1">${a.price.toLocaleString()}</div>
          </ItemCard>
        ))}
      </Section>

      {checkoutOpen && (
        <CheckoutSimulation
          itinerary={itinerary}
          onCancel={() => setCheckoutOpen(false)}
          onComplete={() => {
            setItinerary(prev => ({ ...prev, status: 'confirmed' }));
            setCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Section({ title, icon, color, children }) {
  const borderColors = { blue: 'border-blue-500/20', purple: 'border-purple-500/20', orange: 'border-orange-500/20' };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`glass-card mb-6 border ${borderColors[color]}`}>
      <h3 className="flex items-center text-lg font-semibold text-white mb-5">
        <div className={`p-2 bg-${color}-500/20 rounded-lg mr-3`}>{icon}</div>
        {title}
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </motion.div>
  );
}

function ItemCard({ children, onRemove }) {
  return (
    <div className="bg-surface/50 border border-white/5 rounded-xl p-4 relative group">
      {children}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
