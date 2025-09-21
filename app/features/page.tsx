'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaTools, FaClock, FaBell, FaSync, FaChartBar, FaChartLine } from 'react-icons/fa';

const features = [
  {
    id: 'instant-booking',
    icon: <FaCalendarCheck />,
    title: 'Instant Online Booking',
    description: 'Embedded website widget and standalone mobile app allow customers to book appointments in under 90 seconds.',
    slug: 'instant-booking'
  },
  {
    id: 'auto-calling',
    icon: <FaBell />,
    title: 'Auto Calling & AI Pickups',
    description: 'Automated calling system handles appointment confirmations and after-hours customer inquiries with intelligent AI voice responses.',
    slug: 'auto-calling'
  },
  {
    id: 'slot-optimization',
    icon: <FaClock />,
    title: 'Dynamic Slot Optimization',
    description: 'Real-time analysis of service bay availability, parts lead times, and technician schedules ensures optimal time-slot recommendations.',
    slug: 'slot-optimization'
  },
  {
    id: 'automated-reminders',
    icon: <FaBell />,
    title: 'Automated Reminders & Confirmations',
    description: 'Multi-channel notifications (SMS, email, WhatsApp) confirm bookings instantly, send 48- and 4-hour reminders.',
    slug: 'automated-reminders'
  },
  {
    id: 'real-time-updates',
    icon: <FaSync />,
    title: 'Real-Time Status Updates',
    description: 'Customers receive live updates throughout their service journey with accurate progress tracking and notifications.',
    slug: 'real-time-updates'
  },
  {
    id: 'downtime-insights',
    icon: <FaChartBar />,
    title: 'Downtime Reduction Insights',
    description: 'The dashboard highlights upcoming idle periods predicted by the AI based on scheduled jobs and parts arrival times.',
    slug: 'downtime-insights'
  },
  {
    id: 'performance-analytics',
    icon: <FaChartLine />,
    title: 'Performance Analytics & ROI Reporting',
    description: 'Advanced analytics aggregate key metrics—resource utilization, service completion rates, customer satisfaction, and revenue optimization.',
    slug: 'performance-analytics'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-darkGray to-neutral-900">
      {/* Header */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6"
          >
            ServiceFlow Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-neutral-300 max-w-3xl mx-auto"
          >
            Explore our comprehensive suite of intelligent tools designed to streamline your CRM experience and optimize business operations
          </motion.p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/features/${feature.slug}`}>
                <div className="group bg-neutral-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-700 hover:border-primary/50 cursor-pointer h-full">
                  <div className="text-5xl text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Learn More →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center pb-16">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Home
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
