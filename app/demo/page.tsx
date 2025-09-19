'use client';

import { motion } from 'framer-motion';
import { FaPlay, FaCalendarCheck, FaBell, FaSync, FaChartLine } from 'react-icons/fa';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="relative pt-32 pb-16 z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              See ServiceFlow in Action
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Experience how ServiceFlow transforms your dealership operations with our interactive demo
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-6 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4 mx-auto"
            >
              <FaPlay className="text-lg" />
              Watch Demo Video
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Demo Features */}
      <div className="relative max-w-7xl mx-auto px-6 pb-24 z-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">What You'll See in the Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-darkCard p-8 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaCalendarCheck className="text-4xl text-primary mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Instant Booking Process</h3>
              <p className="text-neutral-200 leading-relaxed">Watch how customers can book appointments in under 90 seconds through our intuitive interface.</p>
            </div>
            <div className="bg-darkCard p-8 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaBell className="text-4xl text-primary mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Automated Communications</h3>
              <p className="text-neutral-200 leading-relaxed">See our multi-channel reminder system in action, reducing no-shows by 40%.</p>
            </div>
            <div className="bg-darkCard p-8 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaSync className="text-4xl text-primary mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Real-Time Updates</h3>
              <p className="text-neutral-200 leading-relaxed">Experience how customers stay informed with live service status updates and accurate ETAs.</p>
            </div>
            <div className="bg-darkCard p-8 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaChartLine className="text-4xl text-primary mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Analytics Dashboard</h3>
              <p className="text-neutral-200 leading-relaxed">Explore comprehensive performance metrics and ROI reporting capabilities.</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-12 rounded-2xl border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Service Department?</h2>
            <p className="text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
              Join leading dealerships who&apos;ve increased their service revenue by 15-25% with intelligent automation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-white px-8 py-4 rounded-full font-semibold border-2 border-primary hover:bg-primary transition-all duration-300"
              >
                Contact Sales
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
