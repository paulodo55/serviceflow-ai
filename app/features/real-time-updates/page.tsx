'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaSync, FaArrowLeft, FaTools, FaCheckCircle, FaBell } from 'react-icons/fa';

export default function RealTimeUpdatesPage() {
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
              <FaSync />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              Real-Time Status Updates
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light">
              Keep customers informed every step of the way with live updates and accurate progress tracking throughout their service experience
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24 z-10">
        {/* Update Types */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Live Service Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaTools className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Service Initiated</h3>
              <p className="text-neutral-200">Customers receive updates when their service request begins processing and work commences.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaBell className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Progress Milestones</h3>
              <p className="text-neutral-200">Live updates as work progresses with detailed status information and completion milestones.</p>
            </div>
            <div className="bg-darkCard p-6 rounded-xl border border-neutral-800 hover:border-primary/40 transition-colors duration-300">
              <FaCheckCircle className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Service Complete</h3>
              <p className="text-neutral-200">Instant notification when service is complete and ready for customer pickup or delivery.</p>
            </div>
          </div>
        </motion.section>

        {/* Service Journey */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Customer Service Journey</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                status: "Request Received",
                description: "Customer receives confirmation that their service request has been received and initial processing has begun"
              },
              {
                step: 2,
                status: "Assessment Complete",
                description: "Detailed assessment results shared with estimated completion time and service breakdown"
              },
              {
                step: 3,
                status: "Service in Progress",
                description: "Regular updates on service progress with detailed explanations of work being performed"
              },
              {
                step: 4,
                status: "Quality Review",
                description: "Notification when service is complete and undergoing final quality review"
              },
              {
                step: 5,
                status: "Ready for Delivery",
                description: "Final notification with delivery/pickup instructions and service summary"
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
                  <h3 className="text-xl font-semibold text-white mb-2">{item.status}</h3>
                  <p className="text-neutral-200 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Customer Benefits</h2>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">90%</div>
                <p className="text-white font-semibold mb-1">Customer Satisfaction</p>
                <p className="text-neutral-200 text-sm">Transparency builds trust and satisfaction</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50%</div>
                <p className="text-white font-semibold mb-1">Fewer Status Calls</p>
                <p className="text-neutral-200 text-sm">Proactive updates reduce customer inquiries</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-white font-semibold mb-1">ETA Accuracy</p>
                <p className="text-neutral-200 text-sm">AI-powered predictions set clear expectations</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}