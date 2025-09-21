// Centralized TypeScript types for ServiceFlow

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'demo' | 'regular' | 'trial';
}

export interface TrialUser extends User {
  fullName: string;
  companyName: string;
  phoneNumber?: string;
  password: string;
  createdAt: Date;
  trialExpiresAt: Date;
  isActive: boolean;
  type: 'trial';
}

export interface DemoUser extends User {
  type: 'demo';
}

// Authentication Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginError {
  message: string;
  field?: 'email' | 'password' | 'general';
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  redirectUrl: string;
}

// Trial Signup Types
export interface TrialSignupData {
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber?: string;
}

export interface TrialSignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    companyName: string;
    trialExpiresAt: Date;
  };
  tempPassword?: string; // Only for development
  accessToken: string;
}

// Email Types
export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeEmailData {
  fullName: string;
  email: string;
  companyName: string;
  tempPassword: string;
}

export interface PasswordResetData {
  fullName: string;
  email: string;
  resetToken: string;
}

// Bubble.io Integration Types
export interface BubbleUser {
  email: string;
  name: string;
  company?: string;
  role: string;
  trial_expires?: string;
}

export interface BubbleTokenResponse {
  success: boolean;
  token: string;
  redirectUrl: string;
  bubbleUserId: string;
  expiresIn?: number;
}

// Security Types
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
  blockDuration: number; // Block duration in milliseconds after max attempts
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  attemptsRemaining?: number;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// API Response Types
export interface ApiError {
  error: string;
  details?: string[];
  retryAfter?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Feature Types (for features page)
export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  slug: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  isSuccess: boolean;
}

// JWT Token Types
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  company?: string;
  type: 'trial' | 'demo' | 'regular';
  trialExpiresAt?: Date;
  timestamp: number;
  iat?: number;
  exp?: number;
}

export interface BubbleJWTPayload extends JWTPayload {
  role: string;
  bubbleUserId: string;
}

// Environment Variables Types
export interface EnvConfig {
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  BUBBLE_API_KEY?: string;
  BUBBLE_API_URL?: string;
  SMTP_PASSWORD?: string;
  RECAPTCHA_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
}

// Utility Types
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export commonly used type combinations
export type AuthUser = User | TrialUser | DemoUser;
export type FormErrors = Record<string, string>;
export type EmailData = WelcomeEmailData | PasswordResetData;
