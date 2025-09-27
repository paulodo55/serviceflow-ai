import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createVoicemailSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  callerName: z.string().optional(),
  duration: z.number().min(1, 'Duration is required'),
  audioUrl: z.string().url('Valid audio URL is required'),
  customerId: z.string().optional(),
  twilioSid: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const isRead = searchParams.get('isRead');
    const transcriptionStatus = searchParams.get('transcriptionStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (customerId) where.customerId = customerId;
    if (isRead !== null) where.isRead = isRead === 'true';
    if (transcriptionStatus) where.transcriptionStatus = transcriptionStatus;

    const [voicemails, total] = await Promise.all([
      prisma.voicemail.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voicemail.count({ where }),
    ]);

    return NextResponse.json({
      voicemails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching voicemails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createVoicemailSchema.parse(body);

    // Try to match customer by phone number
    let customerId = validatedData.customerId;
    if (!customerId && validatedData.phoneNumber) {
      const customer = await prisma.customer.findFirst({
        where: {
          organizationId: user.organization.id,
          phone: validatedData.phoneNumber,
        },
      });
      customerId = customer?.id;
    }

    const voicemail = await prisma.voicemail.create({
      data: {
        ...validatedData,
        customerId,
        organizationId: user.organization.id,
        transcriptionStatus: 'PENDING',
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Start transcription process
    await transcribeVoicemail(voicemail.id, validatedData.audioUrl);

    return NextResponse.json(voicemail, { status: 201 });
  } catch (error) {
    console.error('Error creating voicemail:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues || [] },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark voicemail as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const { voicemailId, isRead } = body;

    if (!voicemailId) {
      return NextResponse.json({ error: 'Voicemail ID is required' }, { status: 400 });
    }

    const voicemail = await prisma.voicemail.findFirst({
      where: {
        id: voicemailId,
        organizationId: user.organization.id,
      },
    });

    if (!voicemail) {
      return NextResponse.json({ error: 'Voicemail not found' }, { status: 404 });
    }

    const updatedVoicemail = await prisma.voicemail.update({
      where: { id: voicemailId },
      data: {
        isRead: isRead ?? true,
        readAt: isRead !== false ? new Date() : null,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json(updatedVoicemail);
  } catch (error) {
    console.error('Error updating voicemail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function transcribeVoicemail(voicemailId: string, audioUrl: string) {
  try {
    // Update status to processing
    await prisma.voicemail.update({
      where: { id: voicemailId },
      data: { transcriptionStatus: 'PROCESSING' },
    });

    // In a real implementation, you would integrate with a transcription service
    // like Google Speech-to-Text, AWS Transcribe, or Azure Speech Services
    
    // For demo purposes, we'll simulate transcription with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transcription result
    const mockTranscriptions = [
      "Hi, this is John Smith calling about my appointment tomorrow. I need to reschedule to next week if possible. Please call me back at 555-123-4567. Thank you.",
      "Hello, I'm calling to inquire about your membership pricing. Could someone please call me back with more information? My number is 555-987-6543.",
      "This is Sarah from ABC Company. We're interested in your services for our office. Please give me a call at 555-456-7890 to discuss further.",
      "Hi there, I missed my appointment today due to traffic. Can we reschedule for tomorrow? Thanks!",
      "I'm having trouble with my account login. Could someone from tech support call me back? My number is 555-234-5678.",
    ];

    const transcript = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    const confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence

    // Update with transcription results
    await prisma.voicemail.update({
      where: { id: voicemailId },
      data: {
        transcript,
        confidence,
        transcriptionStatus: 'COMPLETED',
      },
    });

    console.log(`Voicemail ${voicemailId} transcribed successfully`);
  } catch (error) {
    console.error('Error transcribing voicemail:', error);
    
    // Update status to failed
    await prisma.voicemail.update({
      where: { id: voicemailId },
      data: { transcriptionStatus: 'FAILED' },
    });
  }
}
