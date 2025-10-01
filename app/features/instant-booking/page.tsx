'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaArrowLeft, FaClock, FaMobile, FaDesktop } from 'react-icons/fa';

export default function InstantBookingPage() {
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
              <FaCalendarCheck />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6">
              Turn Website Visitors Into Booked Customers
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-white">Capture more leads before they leave your site.</strong> While competitors make customers call or fill out forms, VervidFlow converts visitors to confirmed appointments in 90 seconds—24/7, mobile-optimized, zero friction.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* Revenue Impact */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 p-10 rounded-2xl border border-primary/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">The Cost of Not Having Instant Booking</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-4">Without VervidFlow</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex gap-2"><span className="text-red-500">❌</span> 78% of visitors leave without booking</li>
                <li className="flex gap-2"><span className="text-red-500">❌</span> Phone tag during business hours only</li>
                <li className="flex gap-2"><span className="text-red-500">❌</span> Lost leads to faster competitors</li>
                <li className="flex gap-2"><span className="text-red-500">❌</span> Staff time wasted on scheduling calls</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-4">With VervidFlow</h3>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex gap-2"><FaClock className="text-green-500 mt-1" /> <span><strong className="text-white">62% conversion rate</strong> from visitor to booked</span></li>
                <li className="flex gap-2"><FaMobile className="text-green-500 mt-1" /> <span><strong className="text-white">24/7 booking</strong> even while you sleep</span></li>
                <li className="flex gap-2"><FaDesktop className="text-green-500 mt-1" /> <span><strong className="text-white">3x faster</strong> than phone scheduling</span></li>
                <li className="flex gap-2"><FaCalendarCheck className="text-green-500 mt-1" /> <span><strong className="text-white">Zero staff time</strong> on appointment booking</span></li>
              </ul>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">$127K</div>
            <div className="text-neutral-300">Average annual revenue increase per location from instant booking</div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Customer Selects Service",
                description: "Intuitive service selection with clear descriptions and pricing transparency"
              },
              {
                step: 2,
                title: "AI Suggests Optimal Times",
                description: "Our AI analyzes technician availability, bay capacity, and parts lead times to suggest the best appointment slots"
              },
              {
                step: 3,
                title: "Instant Confirmation",
                description: "Immediate booking confirmation with calendar integration and automated reminders"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-6 bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Why We Beat Podium, Salesforce & Microsoft */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Businesses Switch from Competitors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-bold text-red-400 mb-3">Podium</h3>
              <p className="text-neutral-400 text-sm mb-3">Limited to messaging, no real booking engine</p>
              <p className="text-green-400 font-semibold">✓ VervidFlow: Full CRM + instant booking</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-bold text-red-400 mb-3">Salesforce</h3>
              <p className="text-neutral-400 text-sm mb-3">Requires custom development for booking</p>
              <p className="text-green-400 font-semibold">✓ VervidFlow: Ready out of the box</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-bold text-red-400 mb-3">Microsoft Dynamics</h3>
              <p className="text-neutral-400 text-sm mb-3">Complex setup, slow mobile experience</p>
              <p className="text-green-400 font-semibold">✓ VervidFlow: Mobile-first, instant</p>
            </div>
          </div>
        </motion.section>

        {/* Works for Any Business */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Perfect for Any Industry</h2>
          <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">Service Industries</h3>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Auto dealerships & repair shops</li>
                  <li>✓ Healthcare & dental practices</li>
                  <li>✓ Salons & spas</li>
                  <li>✓ Home services (HVAC, plumbing)</li>
                  <li>✓ Professional services (law, consulting)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-4">Product-Based Businesses</h3>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Retail stores & showrooms</li>
                  <li>✓ Equipment rentals</li>
                  <li>✓ Warehouses & distribution</li>
                  <li>✓ Restaurants & hospitality</li>
                  <li>✓ Even non-profits & charities</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Start Capturing More Leads Today</h2>
          <Link href="/free-trial">
            <button className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
              Get Instant Booking — Free Trial
            </button>
          </Link>
          <p className="text-neutral-400 mt-4">14-day free trial • No credit card required • Setup in 5 minutes</p>
        </motion.section>
      </div>
    </div>
  );
}
