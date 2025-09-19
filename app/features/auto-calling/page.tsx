'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBell, FaArrowLeft, FaPhone, FaClock, FaMicrophone } from 'react-icons/fa';

export default function AutoCallingPage() {
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
              <FaBell />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Auto Calling & AI Pickups
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Never miss a customer call again with intelligent automated calling and 24/7 AI-powered phone support
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">24/7 Customer Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaPhone className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Automated Confirmations</h3>
              <p className="text-neutral-200">Automatically calls customers to confirm appointments, reducing no-shows by up to 60%.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaClock className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">After-Hours Support</h3>
              <p className="text-neutral-200">AI-powered phone system handles customer inquiries 24/7, even when your team is unavailable.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaMicrophone className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Natural Conversations</h3>
              <p className="text-neutral-200">Advanced voice AI provides human-like interactions, booking appointments and answering questions.</p>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Automatic Appointment Confirmations",
                description: "System automatically calls customers 24-48 hours before their appointment to confirm attendance"
              },
              {
                step: 2,
                title: "AI Phone Reception",
                description: "After-hours calls are answered by our intelligent AI system that can book appointments, answer questions, and handle basic inquiries"
              },
              {
                step: 3,
                title: "Smart Call Routing",
                description: "Complex inquiries are intelligently routed to the appropriate team member with full conversation context"
              },
              {
                step: 4,
                title: "Follow-up Communications",
                description: "Automated follow-up calls for service completion, satisfaction surveys, and maintenance reminders"
              }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                className="flex items-start gap-6 bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-200 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Business Impact */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Business Impact</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">60%</div>
                <p className="text-white font-semibold mb-1">Reduction in No-Shows</p>
                <p className="text-neutral-200 text-sm">Automated confirmations drastically reduce missed appointments</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-white font-semibold mb-1">Customer Support</p>
                <p className="text-neutral-200 text-sm">AI handles inquiries around the clock</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <p className="text-white font-semibold mb-1">Customer Satisfaction</p>
                <p className="text-neutral-200 text-sm">Improved communication leads to happier customers</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
