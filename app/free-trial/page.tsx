'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaBuilding, FaPhone, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

export default function FreeTrialPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    // Phone Number validation (optional but if provided, must be valid)
    if (formData.phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/trial-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setSuccessMessage(result.message || 'Trial account created successfully! Check your email for login credentials.');
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          companyName: '',
          phoneNumber: ''
        });
      } else {
        setErrors({ submit: result.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to VervidFlow!</h2>
          <p className="text-slate-300 mb-6">{successMessage}</p>
          
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="block w-full text-slate-400 hover:text-white transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Marketing Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block text-white"
        >
          <h1 className="text-5xl font-bold mb-6">
            Start Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"> Free Trial</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Experience the power of VervidFlow&apos;s CRM automation. Get instant access to our full platform for 14 days.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>Complete CRM automation suite</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>AI-powered customer interactions</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>Real-time analytics and reporting</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">VervidFlow</h2>
            <p className="text-slate-400">by Vervid</p>
            <p className="text-slate-300 mt-4">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border ${
                    errors.fullName ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name *
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border ${
                    errors.companyName ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your company name"
                />
              </div>
              {errors.companyName && (
                <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border ${
                    errors.phoneNumber ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Start Free Trial</span>
                  <FaArrowRight />
                </>
              )}
            </button>

            {errors.submit && (
              <p className="text-red-400 text-sm text-center">{errors.submit}</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
