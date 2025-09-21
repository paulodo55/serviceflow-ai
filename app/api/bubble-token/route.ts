import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';
import { SECURITY_HEADERS } from '@/lib/security';

// Bubble.io integration configuration
const BUBBLE_CONFIG = {
  appUrl: 'https://odopaul55-61471.bubbleapps.io',
  // In production, these would come from environment variables
  apiKey: process.env.BUBBLE_API_KEY || 'demo-api-key',
  apiUrl: process.env.BUBBLE_API_URL || 'https://odopaul55-61471.bubbleapps.io/api/1.1',
};

interface BubbleUser {
  email: string;
  name: string;
  company?: string;
  role: string;
  trial_expires?: string;
}

// Create or update user in Bubble.io (mock implementation)
const createBubbleUser = async (userData: BubbleUser): Promise<{ success: boolean; bubbleUserId?: string; error?: string }> => {
  try {
    // In production, make actual API call to Bubble.io
    console.log('=== BUBBLE.IO USER CREATION ===');
    console.log('URL:', `${BUBBLE_CONFIG.apiUrl}/obj/user`);
    console.log('User Data:', userData);
    
    // Mock API response
    const mockResponse = {
      success: true,
      bubbleUserId: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    console.log('Response:', mockResponse);
    console.log('=== END BUBBLE CREATION ===');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockResponse;
    
    /* In production, use actual Bubble.io API:
    const response = await fetch(`${BUBBLE_CONFIG.apiUrl}/obj/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BUBBLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Bubble API error: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      bubbleUserId: result.id,
    };
    */
  } catch (error) {
    console.error('Bubble user creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret'
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Extract user information
    const userEmail = token.email as string;
    const userName = token.name as string;
    const userRole = 'trial_user'; // Default role for trial users

    // Create or update user in Bubble.io
    const bubbleResult = await createBubbleUser({
      email: userEmail,
      name: userName,
      role: userRole,
      trial_expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!bubbleResult.success) {
      return NextResponse.json(
        { error: 'Failed to create user in Bubble app' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Generate JWT token for Bubble.io integration
    const bubbleToken = jwt.sign(
      {
        email: userEmail,
        name: userName,
        role: userRole,
        bubbleUserId: bubbleResult.bubbleUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );

    // Generate the redirect URL with token
    const redirectUrl = `${BUBBLE_CONFIG.appUrl}?token=${encodeURIComponent(bubbleToken)}&user=${encodeURIComponent(userEmail)}`;

    return NextResponse.json({
      success: true,
      token: bubbleToken,
      redirectUrl,
      bubbleUserId: bubbleResult.bubbleUserId,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    }, {
      headers: SECURITY_HEADERS
    });

  } catch (error) {
    console.error('Bubble token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Create user in Bubble.io
    const bubbleResult = await createBubbleUser({
      email,
      name,
      company,
      role: 'trial_user',
      trial_expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!bubbleResult.success) {
      return NextResponse.json(
        { error: 'Failed to create user in Bubble app' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Generate JWT token
    const bubbleToken = jwt.sign(
      {
        email,
        name,
        company,
        role: 'trial_user',
        bubbleUserId: bubbleResult.bubbleUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );

    const redirectUrl = `${BUBBLE_CONFIG.appUrl}?token=${encodeURIComponent(bubbleToken)}&user=${encodeURIComponent(email)}`;

    return NextResponse.json({
      success: true,
      token: bubbleToken,
      redirectUrl,
      bubbleUserId: bubbleResult.bubbleUserId,
    }, {
      headers: SECURITY_HEADERS
    });

  } catch (error) {
    console.error('Bubble token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
