'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowLeft, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    setIsSubmitted(true);
    
    // In production, you could send this to an API endpoint
    console.log('Contact form submitted:', formData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <FaCheckCircle className="text-emerald-400 text-6xl mx-auto" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
          <p className="text-slate-300 mb-6">
            Thank you for contacting ServiceFlow. We&apos;ll get back to you within 24 hours.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300 mb-8">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
              Contact Sales
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your CRM experience? Get in touch with our team to learn more about ServiceFlow.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Phone</h3>
                    <div className="space-y-1">
                      <div>
                        <p className="text-slate-400 text-sm">Sales:</p>
                        <a href="tel:2149733761" className="text-slate-300 hover:text-blue-400 transition-colors">
                          (214) 973-3761
                        </a>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">General Questions:</p>
                        <a href="tel:5122645260" className="text-slate-300 hover:text-blue-400 transition-colors">
                          (512) 264-5260
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Email</h3>
                    <a href="mailto:hello@vervidflow.com" className="text-slate-300 hover:text-blue-400 transition-colors">
                      hello@vervidflow.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Business Hours</h3>
                    <p className="text-slate-300">Monday - Friday: 9:00 AM - 6:00 PM CST</p>
                    <p className="text-slate-300">Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Why Choose ServiceFlow?</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-3 flex-shrink-0" />
                  14-day free trial with full access
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-3 flex-shrink-0" />
                  24/7 customer support
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-3 flex-shrink-0" />
                  Easy setup and integration
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-3 flex-shrink-0" />
                  Proven ROI for service businesses
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your business and how ServiceFlow can help..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <FaArrowLeft className="rotate-180" />
              </button>
            </form>

            <p className="text-xs text-slate-500 mt-4 text-center">
              We typically respond within 24 hours during business days.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
