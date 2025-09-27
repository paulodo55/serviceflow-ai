import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailVerificationToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Verify the token
    const payload = verifyEmailVerificationToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: new Date(),
        emailVerificationToken: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
