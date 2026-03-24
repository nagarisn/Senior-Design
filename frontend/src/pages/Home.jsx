import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Calendar, Search, MapPin, Globe, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchAPI } from '../services/api';

export default function Home() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    searchAPI.getDestinations().then(res => setDestinations(res.data)).catch(console.error);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-200">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="heading-xl mb-6">
              Design Your <span className="text-gradient">Dream Journey</span> In Seconds
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-slate-300 font-light leading-relaxed">
              Tell us your budget and vibe. Our intelligent engine instantly tailors flights, luxury stays, and curated activities exactly for you.
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link to="/search" className="btn-primary flex items-center text-lg px-8 py-4 gap-3">
                <Compass className="w-6 h-6" />
                Start Your Adventure
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Calendar, title: "Smart Constraints", desc: "Input strict dates, tight budgets, and niche interests. We handle the complex math to make it fit." },
              { icon: Search, title: "Deep Discovery", desc: "Our engine scans thousands of luxury standard combinations to find the highest value-to-cost ratio." },
              { icon: Globe, title: "Seamless Booking", desc: "One fluid interface to review, personalize, and lock in your entire itinerary with a single click." }
            ].map((feat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="glass-card flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <feat.icon className="h-8 w-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3 text-white">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="heading-lg mb-4">Trending Destinations</h2>
              <p className="text-slate-400 text-lg max-w-2xl">Discover where the world is traveling right now. Hand-picked locations with optimized pricing.</p>
            </div>
            <Link to="/search" className="hidden md:flex items-center text-primary-400 hover:text-primary-300 font-medium">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.slice(0, 8).map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/search?destination=${dest.name}`}
                  className="group relative block overflow-hidden rounded-2xl h-72 w-full"
                >
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surfaceLight to-surface" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-medium text-primary-400">{dest.country}</span>
                      </div>
                      <h3 className="text-3xl font-display font-bold text-white mb-1 drop-shadow-md">{dest.name}</h3>
                      <p className="text-slate-300 text-sm font-medium drop-shadow-md flex items-center">
                        Explore <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
