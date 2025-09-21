'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaGoogle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { FaMicrosoft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginError {
  message: string;
  field?: 'email' | 'password' | 'general';
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter: number } | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session timeout warning
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      
      // Show warning 5 minutes before session expires (25 minutes)
      warningId = setTimeout(() => {
        setShowSessionWarning(true);
      }, 25 * 60 * 1000);
      
      // Auto logout after 30 minutes
      timeoutId = setTimeout(() => {
        signIn();
      }, 30 * 60 * 1000);
    };

    // Reset timers on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetActivity = () => {
      setShowSessionWarning(false);
      resetTimers();
    };

    events.forEach(event => {
      document.addEventListener(event, resetActivity, true);
    });

    resetTimers();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach(event => {
        document.removeEventListener(event, resetActivity, true);
      });
    };
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Generate JWT and redirect to Bubble app
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: session.user?.email,
            password: 'session_login' // Special flag for session-based login
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          window.location.href = data.redirectUrl;
        }
      }
    };
    
    checkSession();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError({ message: 'Email is required', field: 'email' });
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError({ message: 'Please enter a valid email address', field: 'email' });
      return false;
    }
    
    if (!formData.password) {
      setError({ message: 'Password is required', field: 'password' });
      return false;
    }
    
    if (formData.password.length < 8) {
      setError({ message: 'Password must be at least 8 characters long', field: 'password' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRateLimitInfo(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use custom login API for better error handling and Bubble integration
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Bubble app with JWT token
        window.location.href = data.redirectUrl;
      } else {
        if (response.status === 429) {
          setRateLimitInfo({ retryAfter: data.retryAfter });
          setError({ message: data.error, field: 'general' });
        } else {
          setError({ message: data.error || 'Login failed', field: 'general' });
        }
      }
    } catch (err) {
      setError({ message: 'Network error. Please try again.', field: 'general' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/api/auth/callback',
        redirect: false,
      });
      
      if (result?.error) {
        setError({ message: `${provider} login failed. Please try again.`, field: 'general' });
      }
    } catch (err) {
      setError({ message: 'Social login failed. Please try again.', field: 'general' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors
    if (error?.field === name) {
      setError(null);
    }
  };


  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Session timeout warning modal */}
      {showSessionWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-darkCard border border-primary/20 rounded-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
              <h3 className="text-lg font-semibold text-white">Session Expiring Soon</h3>
            </div>
            <p className="text-neutral-300 mb-6">
              Your session will expire in 5 minutes due to inactivity. Click continue to extend your session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSessionWarning(false)}
                className="flex-1 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue Session
              </button>
              <button
                onClick={() => signIn()}
                className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
                ServiceFlow
              </h1>
              <p className="text-sm text-neutral-400 font-light mb-6">by Vervid</p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-2xl font-semibold text-white mb-2"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-neutral-400"
            >
              Sign in to access your ServiceFlow dashboard
            </motion.p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-darkCard/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl"
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  {error.message}
                </p>
                {rateLimitInfo && (
                  <p className="text-red-300 text-xs mt-1">
                    Try again in {rateLimitInfo.retryAfter} seconds
                  </p>
                )}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-darkGray/50 border rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    error?.field === 'email' ? 'border-red-500/50' : 'border-neutral-700'
                  }`}
                  placeholder="Email address"
                  aria-describedby={error?.field === 'email' ? 'email-error' : undefined}
                />
                {error?.field === 'email' && (
                  <p id="email-error" className="mt-1 text-red-400 text-sm">
                    {error.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-darkGray/50 border rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    error?.field === 'password' ? 'border-red-500/50' : 'border-neutral-700'
                  }`}
                  placeholder="Password"
                  aria-describedby={error?.field === 'password' ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {error?.field === 'password' && (
                  <p id="password-error" className="mt-1 text-red-400 text-sm">
                    {error.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary bg-darkGray border-neutral-600 rounded focus:ring-primary/50 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-neutral-300">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-neutral-700"></div>
              <span className="px-4 text-neutral-500 text-sm">or continue with</span>
              <div className="flex-1 border-t border-neutral-700"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-neutral-600 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-neutral-600 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMicrosoft className="text-lg" />
                Continue with Microsoft
              </motion.button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-neutral-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-center text-xs text-neutral-500"
          >
            <p>Protected by enterprise-grade security and reCAPTCHA</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
