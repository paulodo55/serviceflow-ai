import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  SECURITY_HEADERS,
  sanitizeInput,
  validatePasswordStrength,
  getClientId,
  checkRateLimit,
  RATE_LIMITS,
  recordFailedAttempt
} from "@/lib/security";
import { trialUsers } from "@/lib/trial-users";

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

    const { token, password } = await request.json();
    const sanitizedPassword = sanitizeInput(password || '');
    
    if (!token || !sanitizedPassword) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(sanitizedPassword);
    if (!passwordValidation.isValid) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { 
          error: "Password does not meet requirements",
          details: passwordValidation.errors
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Verify reset token
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as {
        email: string;
        purpose: string;
        userId: string;
      };

      if (decoded.purpose !== "password-reset") {
        throw new Error("Invalid token purpose");
      }

      // Find and update trial user password
      const userIndex = trialUsers.findIndex(user => user.id === decoded.userId);
      if (userIndex === -1) {
        recordFailedAttempt(clientId);
        return NextResponse.json(
          { error: "User not found" },
          { status: 404, headers: SECURITY_HEADERS }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);
      
      // Update user password
      trialUsers[userIndex].password = hashedPassword;

      console.log(`Password successfully reset for user: ${decoded.email}`);

      return NextResponse.json({
        message: "Password has been reset successfully"
      }, {
        headers: SECURITY_HEADERS
      });

    } catch (jwtError) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
