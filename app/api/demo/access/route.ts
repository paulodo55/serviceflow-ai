import { NextRequest, NextResponse } from 'next/server';
import { getDemoAccount, createDemoData } from '@/lib/demo-data';
import { generateJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get or create demo account
    let demoUser = await getDemoAccount();
    
    if (!demoUser) {
      // Create fresh demo data
      const demoData = await createDemoData();
      demoUser = demoData.users[0];
    }

    // Generate JWT token for demo user
    const token = generateJWT({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
      organizationId: demoUser.organizationId
    });

    // Return demo access credentials
    return NextResponse.json({
      success: true,
      message: 'Demo access granted',
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        organizationId: demoUser.organizationId,
        organizationName: demoUser.organization?.name || 'Demo Service Company',
        isDemo: true
      },
      token,
      demoFeatures: {
        customers: 5,
        appointments: 4,
        invoices: 3,
        messages: 4,
        fullAccess: true,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Demo access error:', error);
    
    return NextResponse.json(
      { error: 'Failed to provide demo access' },
      { status: 500 }
    );
  }
}
