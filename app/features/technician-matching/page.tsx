'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTools, FaArrowLeft, FaBrain, FaCertificate, FaChartLine } from 'react-icons/fa';

export default function TechnicianMatchingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-darkGray to-neutral-900">
      {/* Header */}
      <div className="pt-24 pb-16">
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
              <FaTools />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6">
              Predictive Technician Matching
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Leverage advanced machine learning to automatically assign the perfect technician for every job, maximizing efficiency and customer satisfaction
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* Key Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">AI-Powered Matching</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaBrain className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Machine Learning</h3>
              <p className="text-neutral-300">Advanced algorithms analyze historical performance data to predict optimal technician assignments.</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaCertificate className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Skill Verification</h3>
              <p className="text-neutral-300">Automatic matching based on certifications, specializations, and proven expertise areas.</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaChartLine className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Performance Optimization</h3>
              <p className="text-neutral-300">Continuously improves matching accuracy based on completion times and quality metrics.</p>
            </div>
          </div>
        </motion.section>

        {/* Matching Criteria */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Matching Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <h3 className="text-xl font-semibold text-white mb-4">Technical Expertise</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Brand-specific certifications
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Service type specializations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Years of experience
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Training completion records
                </li>
              </ul>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Average completion time
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Customer satisfaction scores
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Quality control ratings
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Current workload capacity
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">Business Impact</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">35%</div>
                <p className="text-white font-semibold mb-1">Faster Completion</p>
                <p className="text-neutral-300 text-sm">Average reduction in job completion time</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">92%</div>
                <p className="text-white font-semibold mb-1">First-Time Fix Rate</p>
                <p className="text-neutral-300 text-sm">Jobs completed correctly on first attempt</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
                <p className="text-white font-semibold mb-1">Customer Satisfaction</p>
                <p className="text-neutral-300 text-sm">Average customer rating improvement</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
