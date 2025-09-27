import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { schedulingAI } from '@/lib/scheduling-ai';

export const dynamic = 'force-dynamic';

const suggestionsSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  duration: z.number().min(15).max(480, 'Duration must be between 15 minutes and 8 hours'),
  serviceType: z.string().min(1, 'Service type is required'),
  preferredDates: z.array(z.string().datetime()).min(1, 'At least one preferred date is required').max(7, 'Maximum 7 preferred dates'),
  urgency: z.enum(['low', 'normal', 'high', 'emergency']).default('normal')
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = suggestionsSchema.parse(body);

    // Validate customer belongs to organization
    const customer = await prisma.customer.findUnique({
      where: { 
        id: validatedData.customerId,
        organizationId: user.organizationId
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    const ai = schedulingAI.getInstance(user.organizationId);
    const suggestions = await ai.findOptimalSlots(
      validatedData.customerId,
      validatedData.duration,
      validatedData.serviceType,
      validatedData.preferredDates.map(date => new Date(date)),
      validatedData.urgency
    );

    return NextResponse.json({
      success: true,
      suggestions,
      metadata: {
        customerId: validatedData.customerId,
        customerName: customer.name,
        duration: validatedData.duration,
        serviceType: validatedData.serviceType,
        urgency: validatedData.urgency,
        requestedDates: validatedData.preferredDates.length
      }
    });

  } catch (error) {
    console.error('Scheduling suggestions error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate scheduling suggestions' },
      { status: 500 }
    );
  }
}
