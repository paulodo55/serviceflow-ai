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
              Instant Online Booking
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Transform your customer experience with lightning-fast appointment scheduling that works seamlessly across all platforms
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
          <h2 className="text-3xl font-bold text-white mb-8">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaClock className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">90-Second Booking</h3>
              <p className="text-neutral-300">Customers can complete their entire booking process in under 90 seconds with our streamlined interface.</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaMobile className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Mobile Optimized</h3>
              <p className="text-neutral-300">Fully responsive design ensures perfect functionality across all mobile devices and screen sizes.</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <FaDesktop className="text-3xl text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Website Integration</h3>
              <p className="text-neutral-300">Seamlessly embed our booking widget into your existing website with just a few lines of code.</p>
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

        {/* Technical Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">Technical Features</h2>
          <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
            <ul className="space-y-4 text-neutral-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-4"></div>
                AI-driven queue management prevents booking conflicts
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-4"></div>
                Real-time availability updates across all platforms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-4"></div>
                Automatic integration with your existing DMS
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-4"></div>
                Multi-language support for diverse customer bases
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-4"></div>
                Advanced security with PCI compliance
              </li>
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
