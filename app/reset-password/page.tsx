'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  token: string | null;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResetPasswordState>({
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    isSuccess: false,
    error: null,
    token: null,
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState(prev => ({ ...prev, error: 'Invalid or missing reset token' }));
    } else {
      setState(prev => ({ ...prev, token }));
    }
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.token) {
      setState(prev => ({ ...prev, error: 'Invalid reset token' }));
      return;
    }

    const passwordError = validatePassword(state.password);
    if (passwordError) {
      setState(prev => ({ ...prev, error: passwordError }));
      return;
    }

    if (state.password !== state.confirmPassword) {
      setState(prev => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: state.token,
          password: state.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({ ...prev, isSuccess: true, isLoading: false }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.error,
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
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value,
      error: null,
    }));
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setState(prev => ({
      ...prev,
      [field === 'password' ? 'showPassword' : 'showConfirmPassword']: 
        !prev[field === 'password' ? 'showPassword' : 'showConfirmPassword'],
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

            <h1 className="text-2xl font-bold text-white mb-4">Password Reset Successful</h1>
            <p className="text-neutral-300 mb-8">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue to Login
            </Link>
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
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-neutral-400">
              Enter your new password below to complete the reset process.
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
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={state.showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={state.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-darkGray/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {state.showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={state.showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={state.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-darkGray/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {state.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={state.isLoading || !state.token}
                whileHover={{ scale: state.isLoading ? 1 : 1.02 }}
                whileTap={{ scale: state.isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary text-2xl" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
