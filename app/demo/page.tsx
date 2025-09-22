'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPlay, FaArrowLeft, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaCalendarCheck } from 'react-icons/fa';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    preferredTime: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    setIsSubmitted(true);
    
    // In production, you could send this to an API endpoint
    console.log('Demo request submitted:', formData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-darkCard backdrop-blur-sm rounded-2xl shadow-2xl border border-neutral-800 p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <FaCheckCircle className="text-primary text-6xl mx-auto" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Demo Request Submitted!</h2>
          <p className="text-neutral-300 mb-6">
            Thank you for your interest in ServiceFlow. Our team will contact you within 24 hours to schedule your personalized demo.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Full-screen background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="relative pt-24 pb-8 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-300 mb-8">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
              ServiceFlow Demo
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Watch our product demo and schedule a personalized walkthrough with our team
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 pb-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-darkCard rounded-2xl border border-neutral-800 overflow-hidden">
              {/* Video Placeholder */}
              <div className="aspect-video bg-neutral-900 flex items-center justify-center border-b border-neutral-800">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full cursor-pointer mb-4 hover:shadow-lg transition-all duration-300"
                  >
                    <FaPlay className="text-white text-2xl ml-1" />
                  </motion.div>
                  <p className="text-neutral-400 text-lg">ServiceFlow Product Demo</p>
                  <p className="text-neutral-500 text-sm">Click to watch (5:30)</p>
                </div>
              </div>
              
              {/* Video Description */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">What You&apos;ll See</h3>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-primary mr-3 flex-shrink-0" />
                    Complete booking process (90 seconds)
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-primary mr-3 flex-shrink-0" />
                    Automated reminder system
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-primary mr-3 flex-shrink-0" />
                    Real-time status updates
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-primary mr-3 flex-shrink-0" />
                    Analytics dashboard walkthrough
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-primary mr-3 flex-shrink-0" />
                    ROI calculation examples
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
              <h4 className="text-lg font-semibold text-white mb-4">Why ServiceFlow?</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">15-25%</div>
                  <div className="text-sm text-neutral-300">Revenue Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">40%</div>
                  <div className="text-sm text-neutral-300">Fewer No-Shows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">2+ hrs</div>
                  <div className="text-sm text-neutral-300">Saved Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">90 sec</div>
                  <div className="text-sm text-neutral-300">Booking Time</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-darkCard rounded-2xl shadow-2xl border border-neutral-800 p-8"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Schedule Your Personal Demo</h3>
              <p className="text-neutral-400">Get a customized walkthrough tailored to your business needs</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Preferred Demo Time
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 7 PM)</option>
                  <option value="flexible">I&apos;m flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Tell us about your business
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="What type of service business do you run? How many appointments do you handle per day/week?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FaCalendarCheck />
                <span>Schedule My Demo</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-700">
              <div className="flex items-center justify-center space-x-6 text-sm text-neutral-400">
                <div className="flex items-center">
                  <FaClock className="mr-2 text-primary" />
                  30-minute session
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-2 text-primary" />
                  No pressure sales
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="mr-2 text-primary" />
                  Free consultation
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
