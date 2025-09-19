'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaClock, FaArrowLeft, FaCogs, FaChartBar, FaCalendarAlt } from 'react-icons/fa';

export default function SlotOptimizationPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="relative pt-24 pb-16 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/features" className="inline-flex items-center text-primary hover:text-secondary transition-colors duration-300 mb-8">
            <FaArrowLeft className="mr-2" />
            Back to Features
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="text-6xl text-primary mb-6">
              <FaClock />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Dynamic Slot Optimization
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Maximize your service bay efficiency with intelligent scheduling that adapts in real-time to optimize throughput
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24 z-10">
        {/* Key Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Intelligent Scheduling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaCogs className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Analysis</h3>
              <p className="text-neutral-200">Continuously analyzes service bay availability, technician schedules, and parts lead times.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaChartBar className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Historical Data</h3>
              <p className="text-neutral-200">Uses historical repair durations and patterns to predict optimal scheduling windows.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaCalendarAlt className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Adjustments</h3>
              <p className="text-neutral-200">Automatically adjusts schedules based on job progress and unexpected delays.</p>
            </div>
          </div>
        </motion.section>

        {/* Optimization Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Optimization Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">Smart Bay Management</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Prevents service bay idle time
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Optimizes bay utilization rates
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Balances workload across bays
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Predicts maintenance windows
                </li>
              </ul>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">Time Block Intelligence</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Adjusts based on job complexity
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Accounts for parts availability
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Considers technician expertise
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Minimizes customer wait times
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Proven Results</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">40%</div>
                <p className="text-white font-semibold mb-1">Increased Throughput</p>
                <p className="text-neutral-200 text-sm">More vehicles serviced per day</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25%</div>
                <p className="text-white font-semibold mb-1">Reduced Wait Times</p>
                <p className="text-neutral-200 text-sm">Faster service for customers</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">90%</div>
                <p className="text-white font-semibold mb-1">Bay Utilization</p>
                <p className="text-neutral-200 text-sm">Optimal use of service capacity</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
