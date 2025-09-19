'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowLeft, FaChartBar, FaDollarSign, FaClock } from 'react-icons/fa';

export default function PerformanceAnalyticsPage() {
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
              <FaChartLine />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Performance Analytics & ROI Reporting
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive insights and metrics that drive data-driven decisions and demonstrate clear ROI for your service department
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24 z-10">
        {/* Key Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Key Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaChartBar className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Bay Utilization</h3>
              <p className="text-neutral-200">Track service bay efficiency and identify optimization opportunities in real-time.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaClock className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Repair Time Variance</h3>
              <p className="text-neutral-200">Monitor average repair times and identify bottlenecks in your service process.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaDollarSign className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Revenue Per Bay</h3>
              <p className="text-neutral-200">Calculate profitability metrics and optimize revenue generation per service bay.</p>
            </div>
          </div>
        </motion.section>

        {/* Analytics Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Advanced Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">Interactive Dashboards</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Real-time performance monitoring
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Customizable KPI widgets
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Historical trend analysis
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Comparative benchmarking
                </li>
              </ul>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">ROI Projections</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Monthly profit improvements
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Time saved per service advisor
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Customer satisfaction impact
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Operational efficiency gains
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ROI Impact */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Proven ROI Impact</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2+ Hours</div>
                <p className="text-white font-semibold mb-1">Daily Time Savings</p>
                <p className="text-neutral-200 text-sm">Per service advisor through automation</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25%</div>
                <p className="text-white font-semibold mb-1">Revenue Increase</p>
                <p className="text-neutral-200 text-sm">Average improvement within 3 months</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-white font-semibold mb-1">Data Accuracy</p>
                <p className="text-neutral-200 text-sm">Automated reporting eliminates errors</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
