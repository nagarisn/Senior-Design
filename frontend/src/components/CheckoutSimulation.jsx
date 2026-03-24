import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, Shield, Loader2, Lock } from 'lucide-react';
import { itineraryAPI } from '../services/api';

export default function CheckoutSimulation({ itinerary, onComplete, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate network request to backend payment endpoint
      await itineraryAPI.pay(itinerary.id);
      
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              key="checkout"
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center text-primary-400 font-medium">
                  <Shield className="w-5 h-5 mr-2" /> Secure Checkout
                </div>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
                  Cancel
                </button>
              </div>

              <div className="mb-8 pb-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">{itinerary.name}</h3>
                <div className="flex justify-between text-slate-300 items-end">
                  <span>Total Amount</span>
                  <span className="text-3xl font-display font-bold text-white">${itinerary.total_budget.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Cardholder Name</label>
                  <input type="text" required placeholder="John Doe" className="input-field bg-background/50 border-white/10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" required placeholder="•••• •••• •••• ••••" className="input-field bg-background/50 border-white/10 pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Expiry</label>
                    <input type="text" required placeholder="MM/YY" className="input-field bg-background/50 border-white/10" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">CVC</label>
                    <input type="text" required placeholder="•••" className="input-field bg-background/50 border-white/10" />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-4 mt-8 flex justify-center items-center text-lg"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="w-5 h-5 mr-2" /> Pay ${itinerary.total_budget.toLocaleString()}</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>
              <h2 className="heading-md mb-2 text-white">Payment Successful</h2>
              <p className="text-slate-400">Your trip is confirmed. Redirecting...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
