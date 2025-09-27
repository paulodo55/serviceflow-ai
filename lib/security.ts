// Security utilities for VervidFlow
import { NextRequest } from 'next/server';
import { RateLimitConfig, RateLimitResult, PasswordValidation } from '@/types';
import crypto from 'crypto';

// Rate limiting storage
const rateLimitStore = new Map<string, { 
  attempts: number; 
  lastAttempt: number; 
  windowStart: number;
}>();

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Default rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDuration: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDuration: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDuration: 60 * 60 * 1000 }, // 3 attempts per hour
  API_GENERAL: { windowMs: 60 * 1000, maxAttempts: 60, blockDuration: 5 * 60 * 1000 }, // 60 requests per minute
};

// Get client identifier (IP + User-Agent hash for better uniqueness)
export const getClientId = (request: NextRequest): string => {
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 10);
  
  return `${ip}_${userAgentHash}`;
};

// Check rate limit
export const checkRateLimit = (
  clientId: string, 
  config: RateLimitConfig
): RateLimitResult => {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record) {
    // First request from this client
    rateLimitStore.set(clientId, {
      attempts: 1,
      lastAttempt: now,
      windowStart: now,
    });
    return { allowed: true, attemptsRemaining: config.maxAttempts - 1 };
  }

  // Check if we're in a block period
  if (record.attempts >= config.maxAttempts) {
    const blockEndsAt = record.lastAttempt + config.blockDuration;
    if (now < blockEndsAt) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((blockEndsAt - now) / 1000) 
      };
    } else {
      // Block period ended, reset
      rateLimitStore.set(clientId, {
        attempts: 1,
        lastAttempt: now,
        windowStart: now,
      });
      return { allowed: true, attemptsRemaining: config.maxAttempts - 1 };
    }
  }

  // Check if we're in the same window
  const windowEndsAt = record.windowStart + config.windowMs;
  if (now <= windowEndsAt) {
    // Same window, increment attempts
    record.attempts++;
    record.lastAttempt = now;
    rateLimitStore.set(clientId, record);

    if (record.attempts >= config.maxAttempts) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil(config.blockDuration / 1000) 
      };
    }

    return { 
      allowed: true, 
      attemptsRemaining: config.maxAttempts - record.attempts 
    };
  } else {
    // New window, reset
    rateLimitStore.set(clientId, {
      attempts: 1,
      lastAttempt: now,
      windowStart: now,
    });
    return { allowed: true, attemptsRemaining: config.maxAttempts - 1 };
  }
};

// Record failed attempt
export const recordFailedAttempt = (clientId: string): void => {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);
  
  if (record) {
    record.attempts++;
    record.lastAttempt = now;
    rateLimitStore.set(clientId, record);
  } else {
    rateLimitStore.set(clientId, {
      attempts: 1,
      lastAttempt: now,
      windowStart: now,
    });
  }
};

// Clear rate limit (on successful operation)
export const clearRateLimit = (clientId: string): void => {
  rateLimitStore.delete(clientId);
};

// Generate CSRF token
export const generateCSRFToken = (sessionId: string): string => {
  const token = Buffer.from(
    `${sessionId}_${Date.now()}_${Math.random().toString(36)}`
  ).toString('base64url');
  
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + (60 * 60 * 1000), // 1 hour
  });
  
  return token;
};

// Validate CSRF token
export const validateCSRFToken = (sessionId: string, token: string): boolean => {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  if (stored.token !== token) return false;
  
  return true;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

// Password strength validation
export const validatePasswordStrength = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (7-15 digits)
  if (cleaned.length < 7 || cleaned.length > 15) return false;
  
  // Basic pattern matching for common formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(cleaned);
};

// Company name validation
export const isValidCompanyName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100;
};

// Name validation
export const isValidName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  return nameRegex.test(sanitized) && sanitized.length >= 2 && sanitized.length <= 50;
};

// Clean up expired tokens and rate limits
export const cleanupExpiredData = (): void => {
  const now = Date.now();
  
  // Clean up expired CSRF tokens
  csrfTokens.forEach((data, sessionId) => {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  });
  
  // Clean up old rate limit entries (older than 24 hours)
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  rateLimitStore.forEach((data, clientId) => {
    if (data.lastAttempt < oneDayAgo) {
      rateLimitStore.delete(clientId);
    }
  });
};

// Twilio signature validation
export const validateTwilioSignature = (
  body: string,
  signature: string,
  url?: string
): boolean => {
  try {
    if (!process.env.TWILIO_AUTH_TOKEN) {
      console.error('TWILIO_AUTH_TOKEN not configured');
      return false;
    }

    const webhookUrl = url || process.env.TWILIO_WEBHOOK_BASE_URL || '';
    
    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha1', process.env.TWILIO_AUTH_TOKEN)
      .update(webhookUrl + body)
      .digest('base64');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error validating Twilio signature:', error);
    return false;
  }
};

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredData, 60 * 60 * 1000);
}

// Security headers for API responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.vercel.com;",
};

// Export security utilities as named exports
const securityUtils = {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  isValidPhoneNumber,
  isValidCompanyName,
  isValidName,
  getClientId,
  validateTwilioSignature,
  RATE_LIMITS,
  SECURITY_HEADERS,
};

export default securityUtils;
