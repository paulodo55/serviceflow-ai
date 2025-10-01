'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRocket, FaArrowLeft, FaDatabase, FaUpload, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function QuickOnboardingPage() {
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
              <FaRocket className="text-4xl text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6">
              5-Minute Data Onboarding
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-white">Salesforce takes 30+ days. Microsoft Dynamics takes weeks of consulting.</strong> We get you operational in 5 minutes with zero data loss.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
        {/* Why This Matters */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-10 rounded-2xl border border-neutral-700"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <FaClock className="text-primary" />
            Why Speed Matters for Your Bottom Line
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-3">Traditional CRM Implementation</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>30-90 days before launch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>$15,000-$50,000 consulting fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Data migration nightmares</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Months of employee training</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Lost revenue during transition</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary mb-3">VervidFlow Implementation</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span><strong className="text-white">5 minutes</strong> to full operation</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span><strong className="text-white">$0</strong> setup or consulting fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Automatic data mapping & import</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Intuitive UI, zero training needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Start closing deals immediately</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Three Simple Steps to Go Live
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 p-6 rounded-xl border border-primary/30">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-bold text-white mb-3">Upload Your Data</h3>
              <p className="text-neutral-300">
                Drop your Excel, CSV, or database export. We support <strong className="text-white">any format</strong>—even messy spreadsheets from 1995.
              </p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-secondary/30">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-bold text-white mb-3">Auto-Map Fields</h3>
              <p className="text-neutral-300">
                Our AI automatically matches your columns to the right fields. <strong className="text-white">No manual mapping</strong> of thousands of records.
              </p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-primary/30">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-bold text-white mb-3">Start Working</h3>
              <p className="text-neutral-300">
                All customers, contacts, history, and deals are ready. <strong className="text-white">Your team can start today</strong>—not next month.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Real Business Impact */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/10 p-10 rounded-2xl border border-primary/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Real Impact on Your Business</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">$47K</div>
              <div className="text-neutral-300">Average savings vs Salesforce implementation</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">85 Days</div>
              <div className="text-neutral-300">Faster time to revenue vs traditional CRM</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">0%</div>
              <div className="text-neutral-300">Data loss during migration—guaranteed</div>
            </div>
          </div>
        </motion.div>

        {/* Industry Adaptability */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Works for Every Industry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Auto Dealerships', 'Healthcare', 'Real Estate', 'Manufacturing',
              'Retail', 'Non-Profits', 'Warehouses', 'Professional Services',
              'Hospitality', 'Education', 'Construction', 'Any Business'
            ].map((industry, idx) => (
              <div key={idx} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 text-center text-white">
                {industry}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started in 5 Minutes?</h2>
          <Link href="/free-trial">
            <button className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
              Start Free Trial — No Credit Card Required
            </button>
          </Link>
          <p className="text-neutral-400 mt-4">Join thousands of businesses who switched in minutes</p>
        </motion.div>
      </div>
    </div>
  );
}

