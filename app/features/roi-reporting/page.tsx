'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowLeft, FaDollarSign, FaArrowUp, FaCrown } from 'react-icons/fa';

export default function ROIReportingPage() {
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
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-6xl text-primary">
                <FaChartLine />
              </div>
              <div className="text-3xl text-yellow-500">
                <FaCrown />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              ROI Reporting & Analytics
            </h1>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-3 rounded-full border border-yellow-500/30 mb-6 inline-block">
              <span className="text-yellow-400 font-semibold">Enterprise Feature</span>
            </div>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Advanced ROI analytics and comprehensive reporting to measure and optimize your business performance with precision
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Advanced ROI Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaDollarSign className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Revenue Attribution</h3>
              <p className="text-neutral-200">Track revenue directly attributable to VervidFlow automation and optimization.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaArrowUp className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Performance Trends</h3>
              <p className="text-neutral-200">Analyze long-term trends in efficiency, customer satisfaction, and profitability.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaChartLine className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Cost Savings Analysis</h3>
              <p className="text-neutral-200">Detailed breakdown of operational cost savings through automation and efficiency gains.</p>
            </div>
          </div>
        </motion.section>

        {/* Reporting Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Enterprise Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">Executive Dashboards</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  C-level executive summaries
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Board-ready presentations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Strategic performance insights
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Competitive benchmarking
                </li>
              </ul>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800">
              <h3 className="text-xl font-semibold text-white mb-4">Custom Analytics</h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Tailored KPI tracking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Department-specific metrics
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Multi-location reporting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Predictive analytics
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ROI Calculator */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Typical ROI Results</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">340%</div>
                <p className="text-white font-semibold mb-1">Average ROI</p>
                <p className="text-neutral-200 text-sm">Within first 12 months of implementation</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">$2.1M</div>
                <p className="text-white font-semibold mb-1">Average Annual Savings</p>
                <p className="text-neutral-200 text-sm">Through efficiency and automation gains</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">6 Months</div>
                <p className="text-white font-semibold mb-1">Payback Period</p>
                <p className="text-neutral-200 text-sm">Time to full investment recovery</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Enterprise CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-8 rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready for Enterprise Analytics?</h2>
            <p className="text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
              Unlock the full potential of your data with comprehensive ROI reporting and advanced analytics
            </p>
            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
            >
              Explore Enterprise Plans
            </motion.a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
