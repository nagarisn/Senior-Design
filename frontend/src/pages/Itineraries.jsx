import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Calendar, DollarSign, MapPin, Compass, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { itineraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CheckoutSimulation from '../components/CheckoutSimulation';

export default function Itineraries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutItinerary, setCheckoutItinerary] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);

  const handleDownloadPdf = async (itinerary) => {
    setPdfLoading(itinerary.id);
    try {
      const response = await itineraryAPI.downloadPdf(itinerary.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartTravel_Itinerary_${itinerary.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleDelete = async (itineraryId) => {
    if (!window.confirm('Delete this itinerary?')) return;
    try {
      await itineraryAPI.delete(itineraryId);
      setItineraries(itineraries.filter(i => i.id !== itineraryId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      itineraryAPI.getUserItineraries(user.user_id)
        .then(res => setItineraries(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card text-center max-w-md w-full p-10">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="heading-md mb-4 text-white">Access Denied</h2>
          <p className="text-slate-400 mb-8">You must be logged into the portal to view your curated itineraries.</p>
          <Link to="/login" className="btn-primary w-full inline-block">Secure Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="heading-xl mb-2 text-white"><span className="text-primary-400">Master</span> Itineraries</h1>
          <p className="text-slate-400 text-lg">Your portfolio of upcoming and past adventures.</p>
        </div>
        <Link to="/search" className="btn-accent mt-6 md:mt-0 flex items-center">
          <Compass className="w-5 h-5 mr-2" /> New Journey
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 glass-card animate-pulse bg-surfaceLight/50"></div>
          ))}
        </div>
      ) : itineraries.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20 px-4 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Compass className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="heading-md mb-3 text-white">The Canvas is Empty</h3>
          <p className="text-slate-400 mb-8 text-lg">You haven't locked in any itineraries yet. Let our AI build the perfect experience for you.</p>
          <Link to="/search" className="btn-primary px-8">Start Discovery</Link>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {itineraries.map(itinerary => (
            <motion.div
              key={itinerary.id}
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="glass-card group relative overflow-hidden flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/itineraries/${itinerary.id}`)}
            >
              <div className="absolute top-0 right-0 p-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  itinerary.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  itinerary.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {itinerary.status}
                </span>
              </div>
              
              <div className="mt-4 mb-2 flex items-center text-primary-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold tracking-wide uppercase">{itinerary.destination}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-6 line-clamp-2">{itinerary.name}</h3>
              
              <div className="space-y-3 text-slate-300 mt-auto mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(itinerary.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - {new Date(itinerary.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-white">${itinerary.total_budget.toLocaleString()} Limit</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (itinerary.status !== 'confirmed') {
                    setCheckoutItinerary(itinerary);
                  }
                }}
                disabled={itinerary.status === 'confirmed'}
                className={`w-full py-3 font-medium rounded-xl transition-colors mt-auto border ${
                  itinerary.status === 'confirmed'
                    ? 'bg-transparent text-slate-500 border-transparent cursor-default'
                    : 'bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border-primary-500/20'
                }`}
              >
                {itinerary.status === 'confirmed' ? 'Successfully Booked' : 'Complete Booking Simulation'}
              </button>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownloadPdf(itinerary); }}
                  disabled={pdfLoading === itinerary.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {pdfLoading === itinerary.id ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(itinerary.id); }}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutItinerary && (
          <CheckoutSimulation 
            itinerary={checkoutItinerary}
            onCancel={() => setCheckoutItinerary(null)}
            onComplete={() => {
              setItineraries(itineraries.map(i => i.id === checkoutItinerary.id ? {...i, status: 'confirmed'} : i));
              setCheckoutItinerary(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
