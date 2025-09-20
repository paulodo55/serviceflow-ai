import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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
          error: "Too many attempts. Please try again in 5 minutes.",
          retryAfter: Math.ceil((300000 - (now - rateLimit.lastAttempt)) / 1000)
        },
        { status: 429 }
      );
    }

    // Update rate limit
    rateLimitStore.set(clientIP, {
      attempts: (rateLimit?.attempts || 0) + 1,
      lastAttempt: now
    });

    // Generate reset token
    const resetToken = jwt.sign(
      { email, purpose: "password-reset" },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "1h" }
    );

    // In production, send email with reset link
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json({
      message: "If an account with this email exists, you will receive a password reset link.",
      resetToken: resetToken // Remove this in production
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
