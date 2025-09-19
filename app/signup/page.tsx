'use client';

import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaBuilding, FaPhone } from 'react-icons/fa';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-6 py-24 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Start Your ServiceFlow Journey
            </h1>
            <p className="text-xl text-neutral-200 mb-8 leading-relaxed font-light">
              Join leading dealerships who've increased their service revenue by 15-25% with intelligent automation
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <span className="text-neutral-200">90-second appointment booking</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <span className="text-neutral-200">40% reduction in no-shows</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <span className="text-neutral-200">24/7 AI customer support</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-darkCard p-8 rounded-2xl border border-neutral-800"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Account</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-neutral-200 mb-2 font-medium">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-200 mb-2 font-medium">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-4 text-neutral-400" />
                  <input
                    type="email"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-200 mb-2 font-medium">Company Name</label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors duration-300"
                    placeholder="Enter your dealership name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-200 mb-2 font-medium">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-4 text-neutral-400" />
                  <input
                    type="tel"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                type="submit"
              >
                Start Free Trial
              </motion.button>

              <p className="text-center text-neutral-400 text-sm">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
