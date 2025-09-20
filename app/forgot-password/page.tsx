'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  retryAfter?: number;
}

export default function ForgotPasswordPage() {
  const [state, setState] = useState<ForgotPasswordState>({
    email: '',
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.email) {
      setState(prev => ({ ...prev, error: 'Email is required' }));
      return;
    }
    
    if (!validateEmail(state.email)) {
      setState(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({ ...prev, isSuccess: true, isLoading: false }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.error,
          retryAfter: data.retryAfter,
          isLoading: false,
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Network error. Please try again.',
        isLoading: false,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      email: e.target.value,
      error: null,
    }));
  };

  if (state.isSuccess) {
    return (
      <div className="min-h-screen bg-dark relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheck className="text-green-500 text-2xl" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-neutral-300 mb-8">
              If an account with <strong>{state.email}</strong> exists, you&apos;ll receive a password reset link shortly.
            </p>

            <div className="space-y-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <FaArrowLeft />
                Back to login
              </Link>
              
              <p className="text-sm text-neutral-400">
                Didn&apos;t receive an email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
            >
              <FaArrowLeft />
              Back to login
            </Link>
            
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-neutral-400">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-darkCard/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl"
          >
            {/* Error Message */}
            {state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  {state.error}
                </p>
                {state.retryAfter && (
                  <p className="text-red-300 text-xs mt-1">
                    Try again in {state.retryAfter} seconds
                  </p>
                )}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={state.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-darkGray/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <motion.button
                type="submit"
                disabled={state.isLoading}
                whileHover={{ scale: state.isLoading ? 1 : 1.02 }}
                whileTap={{ scale: state.isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 text-center text-xs text-neutral-500"
          >
            <p>Password reset links expire after 1 hour for security</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
