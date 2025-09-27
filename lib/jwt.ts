import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('auth-token');
  return tokenCookie?.value || null;
}

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign(
    { email, purpose: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyEmailVerificationToken(token: string): { email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.purpose === 'email_verification') {
      return { email: payload.email };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function generatePasswordResetToken(email: string): string {
  return jwt.sign(
    { email, purpose: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function verifyPasswordResetToken(token: string): { email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.purpose === 'password_reset') {
      return { email: payload.email };
    }
    return null;
  } catch (error) {
    return null;
  }
}
