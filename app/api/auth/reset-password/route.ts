import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify reset token
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as {
        email: string;
        purpose: string;
      };

      if (decoded.purpose !== "password-reset") {
        throw new Error("Invalid token purpose");
      }

      // Hash new password
      const hashedPassword = await hash(password, 12);

      // In production, update password in database
      console.log(`Password reset for: ${decoded.email}`);
      console.log(`New hashed password: ${hashedPassword}`);

      return NextResponse.json({
        message: "Password has been reset successfully"
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
