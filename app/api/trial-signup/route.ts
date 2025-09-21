import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { trialUsers, addTrialUser, findTrialUserByEmail } from '@/lib/trial-users';
import { createWelcomeEmail, sendEmail } from '@/lib/email-service';
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit, 
  getClientId, 
  RATE_LIMITS, 
  SECURITY_HEADERS,
  sanitizeInput,
  isValidEmail,
  isValidName,
  isValidCompanyName,
  isValidPhoneNumber
} from '@/lib/security';
import { TrialSignupData, TrialSignupResponse } from '@/types';

// Generate temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send welcome email using the email service
const sendWelcomeEmail = async (userData: {
  fullName: string;
  email: string;
  companyName: string;
  tempPassword: string;
}) => {
  const emailTemplate = createWelcomeEmail(userData);
  return await sendEmail(emailTemplate);
};

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientId = getClientId(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.SIGNUP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: SECURITY_HEADERS
        }
      );
    }

    const body = await request.json();
    const { fullName, email, companyName, phoneNumber } = body;

    // Sanitize inputs
    const sanitizedFullName = sanitizeInput(fullName || '');
    const sanitizedEmail = sanitizeInput(email || '').toLowerCase();
    const sanitizedCompanyName = sanitizeInput(companyName || '');
    const sanitizedPhoneNumber = phoneNumber ? sanitizeInput(phoneNumber) : undefined;

    // Input validation
    if (!sanitizedFullName || !sanitizedEmail || !sanitizedCompanyName) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'Full name, email, and company name are required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!isValidEmail(sanitizedEmail)) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!isValidName(sanitizedFullName)) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'Please provide a valid full name (2-50 characters, letters only)' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!isValidCompanyName(sanitizedCompanyName)) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'Please provide a valid company name (2-100 characters)' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (sanitizedPhoneNumber && !isValidPhoneNumber(sanitizedPhoneNumber)) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'Please provide a valid phone number' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check if user already exists
    const existingUser = findTrialUserByEmail(sanitizedEmail);
    if (existingUser) {
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create trial user
    const newUser = {
      id: `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      companyName: sanitizedCompanyName,
      phoneNumber: sanitizedPhoneNumber,
      password: hashedPassword,
      createdAt: new Date(),
      trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
    };

    // Add to storage
    addTrialUser(newUser);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        fullName: newUser.fullName,
        email: newUser.email,
        companyName: newUser.companyName,
        tempPassword,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with signup even if email fails
    }

    // Clear rate limit on successful signup
    clearRateLimit(clientId);

    // Generate access token for immediate login (optional)
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
        type: 'trial',
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Trial account created successfully! Check your email for login credentials.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        companyName: newUser.companyName,
        trialExpiresAt: newUser.trialExpiresAt,
      },
      tempPassword, // In production, don't return this
      accessToken,
    }, {
      headers: SECURITY_HEADERS
    });

  } catch (error) {
    console.error('Trial signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// GET endpoint to retrieve trial users (for admin/debugging)
export async function GET() {
  try {
    // In production, add proper authentication for this endpoint
    const activeTrials = trialUsers
      .filter(user => user.isActive && user.trialExpiresAt > new Date())
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        createdAt: user.createdAt,
        trialExpiresAt: user.trialExpiresAt,
      }));

    return NextResponse.json({
      totalTrials: trialUsers.length,
      activeTrials: activeTrials.length,
      users: activeTrials,
    });
  } catch (error) {
    console.error('Error fetching trial users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: trialUsers array is managed in lib/trial-users.ts for shared access
