import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { findTrialUserByEmail } from "@/lib/trial-users";

// Mock user database - replace with your actual database
const users = [
  {
    id: "1",
    email: "demo@vervidflow.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2ukD5/rO4W", // "password123"
    name: "Demo User",
    type: "demo",
  },
];

// Rate limiting storage
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, password, recaptchaToken } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Rate limiting check
    const clientIP = request.ip || "unknown";
    const now = Date.now();
    const rateLimit = rateLimitStore.get(clientIP);
    
    if (rateLimit && rateLimit.attempts >= 5 && (now - rateLimit.lastAttempt) < 300000) { // 5 minutes
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again in 5 minutes.",
          retryAfter: Math.ceil((300000 - (now - rateLimit.lastAttempt)) / 1000)
        },
        { status: 429 }
      );
    }

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

    // Find user in both regular users and trial users
    let user = users.find((user) => user.email === email);
    let trialUser = findTrialUserByEmail(email);
    
    if (!user && !trialUser) {
      // Update rate limit on failed attempt
      rateLimitStore.set(clientIP, {
        attempts: (rateLimit?.attempts || 0) + 1,
        lastAttempt: now
      });
      
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    let userData: any = null;

    if (user) {
      isPasswordValid = await compare(password, user.password);
      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type || 'regular'
      };
    } else if (trialUser) {
      isPasswordValid = await compare(password, trialUser.password);
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
      // Update rate limit on failed attempt
      rateLimitStore.set(clientIP, {
        attempts: (rateLimit?.attempts || 0) + 1,
        lastAttempt: now
      });
      
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    rateLimitStore.delete(clientIP);

    // Generate JWT for Bubble integration
    const bubbleToken = jwt.sign(
      { 
        id: userData.id,
        email: userData.email,
        name: userData.name,
        company: userData.company,
        type: userData.type,
        trialExpiresAt: userData.trialExpiresAt,
        timestamp: Date.now()
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    // Use Bubble.io app URL for redirect
    const redirectUrl = `https://odopaul55-61471.bubbleapps.io?token=${encodeURIComponent(bubbleToken)}&user=${encodeURIComponent(userData.email)}`;

    return NextResponse.json({
      message: "Login successful",
      user: userData,
      token: bubbleToken,
      redirectUrl
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
