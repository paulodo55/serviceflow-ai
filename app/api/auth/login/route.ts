import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { findTrialUserByEmail } from "@/lib/trial-users";
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit, 
  getClientId, 
  RATE_LIMITS, 
  SECURITY_HEADERS,
  sanitizeInput,
  isValidEmail
} from "@/lib/security";

// Mock user database - replace with your actual database
const users = [
  {
    id: "1",
    email: "demo@vervidai.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2ukD5/rO4W", // "password123"
    name: "Demo User",
    type: "demo",
  },
  {
    id: "2",
    email: "paulodo55@example.com",
    username: "paulodo55",
    password: "$2a$12$VfgkTBFcCieYiLKduW045.bwwDipxdKuxNzVhikM/K9zTX0i7.PFS", // "verviddemo123"
    name: "Paul Odo",
    type: "admin",
  },
  {
    id: "3",
    email: "odopaul55@gmail.com",
    username: "odopaul55",
    password: "$2a$12$VfgkTBFcCieYiLKduW045.bwwDipxdKuxNzVhikM/K9zTX0i7.PFS", // "verviddemo123"
    name: "Paul Odo",
    type: "admin",
  },
];

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientId = getClientId(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.LOGIN);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: SECURITY_HEADERS
        }
      );
    }

    const { email, password, recaptchaToken } = await request.json();
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email || '').toLowerCase();
    const sanitizedPassword = sanitizeInput(password || '');
    
    if (!sanitizedEmail || !sanitizedPassword) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Skip email validation since we now support usernames too
    // Users can login with either email or username

    // Verify reCAPTCHA (in production)
    if (recaptchaToken && process.env.RECAPTCHA_SECRET) {
      const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`,
      });
      
      const recaptchaResult = await recaptchaResponse.json();
      if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    // Find user in both regular users and trial users (support email or username)
    let user = users.find((user) => 
      user.email === sanitizedEmail || 
      (user as any).username === sanitizedEmail
    );
    let trialUser = findTrialUserByEmail(sanitizedEmail);
    
    if (!user && !trialUser) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Verify password
    let isPasswordValid = false;
    let userData: any = null;

    if (user) {
      isPasswordValid = await compare(sanitizedPassword, user.password);
      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type || 'regular'
      };
    } else if (trialUser) {
      isPasswordValid = await compare(sanitizedPassword, trialUser.password);
      userData = {
        id: trialUser.id,
        email: trialUser.email,
        name: trialUser.fullName,
        company: trialUser.companyName,
        type: 'trial',
        trialExpiresAt: trialUser.trialExpiresAt
      };
    }
    
    if (!isPasswordValid) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Clear rate limit on successful login
    clearRateLimit(clientId);

    return NextResponse.json({
      message: "Login successful",
      user: userData
    }, {
      headers: SECURITY_HEADERS
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
