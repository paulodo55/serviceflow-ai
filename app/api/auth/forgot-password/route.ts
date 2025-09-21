import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  getClientId, 
  RATE_LIMITS, 
  SECURITY_HEADERS,
  sanitizeInput,
  isValidEmail
} from "@/lib/security";
import { findTrialUserByEmail } from "@/lib/trial-users";
import { createPasswordResetEmail, sendEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientId = getClientId(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.PASSWORD_RESET);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many password reset attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: SECURITY_HEADERS
        }
      );
    }

    const { email } = await request.json();
    const sanitizedEmail = sanitizeInput(email || '').toLowerCase();
    
    if (!sanitizedEmail) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!isValidEmail(sanitizedEmail)) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check if user exists (trial user)
    const trialUser = findTrialUserByEmail(sanitizedEmail);
    
    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account with this email exists, you will receive a password reset link.";
    
    if (trialUser) {
      // Generate reset token
      const resetToken = jwt.sign(
        { 
          email: sanitizedEmail, 
          purpose: "password-reset",
          userId: trialUser.id 
        },
        process.env.NEXTAUTH_SECRET || "fallback-secret",
        { expiresIn: "1h" }
      );

      // Send password reset email
      try {
        const resetEmail = createPasswordResetEmail({
          fullName: trialUser.fullName,
          email: sanitizedEmail,
          resetToken
        });
        
        await sendEmail(resetEmail);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue with success response even if email fails
      }
    }

    return NextResponse.json({
      message: successMessage
    }, {
      headers: SECURITY_HEADERS
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
