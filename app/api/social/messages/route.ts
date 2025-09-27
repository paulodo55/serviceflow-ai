import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendMessageSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  customerId: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  threadId: z.string().optional(),
  parentMessageId: z.string().optional(),
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'WHATSAPP']),
  messageType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LINK', 'STORY', 'REEL']).default('TEXT'),
  mediaUrls: z.array(z.string()).default([]),
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
    const platform = searchParams.get('platform');
    const accountId = searchParams.get('accountId');
    const customerId = searchParams.get('customerId');
    const threadId = searchParams.get('threadId');
    const direction = searchParams.get('direction');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (platform) where.platform = platform;
    if (accountId) where.accountId = accountId;
    if (customerId) where.customerId = customerId;
    if (threadId) where.threadId = threadId;
    if (direction) where.direction = direction;
    if (status) where.status = status;

    const [messages, total] = await Promise.all([
      prisma.socialMessage.findMany({
        where,
        include: {
          account: {
            select: { id: true, platform: true, accountName: true },
          },
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { platformCreatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.socialMessage.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching social messages:', error);
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
    const validatedData = sendMessageSchema.parse(body);

    // Verify account belongs to organization
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id: validatedData.accountId,
        organizationId: user.organization.id,
        isActive: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social media account not found' }, { status: 404 });
    }

    // Generate external ID for tracking
    const externalId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create message record
    const message = await prisma.socialMessage.create({
      data: {
        organizationId: user.organization.id,
        accountId: validatedData.accountId,
        customerId: validatedData.customerId,
        externalId,
        threadId: validatedData.threadId,
        content: validatedData.content,
        mediaUrls: validatedData.mediaUrls,
        senderName: user.name,
        senderHandle: account.accountName,
        platform: validatedData.platform,
        messageType: validatedData.messageType,
        direction: 'OUTBOUND',
        status: 'SENT',
        parentMessageId: validatedData.parentMessageId,
        isResponse: !!validatedData.parentMessageId,
        respondedAt: validatedData.parentMessageId ? new Date() : null,
        respondedBy: validatedData.parentMessageId ? user.id : null,
        platformCreatedAt: new Date(),
      },
      include: {
        account: {
          select: { id: true, platform: true, accountName: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Here you would integrate with the actual social media platform APIs
    // to send the message. For now, we'll simulate success.
    
    // Update message status based on platform response
    await prisma.socialMessage.update({
      where: { id: message.id },
      data: { 
        status: 'DELIVERED',
        // In real implementation, you'd get the actual external ID from the platform
        externalId: `${validatedData.platform.toLowerCase()}_${externalId}`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending social message:', error);
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

// Webhook endpoint to receive incoming messages from social platforms
export async function PUT(request: NextRequest) {
  try {
    // This would be called by social media platforms when new messages arrive
    const signature = request.headers.get('X-Hub-Signature-256');
    const body = await request.text();
    
    // Verify webhook signature (implementation depends on platform)
    // const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const data = JSON.parse(body);
    
    // Parse webhook data based on platform
    const messageData = parseWebhookData(data);
    
    if (!messageData) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    // Find the account this message belongs to
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        platform: messageData.platform,
        accountId: messageData.accountId,
        isActive: true,
      },
      include: { organization: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Try to match customer by sender information
    let customer = null;
    if (messageData.senderHandle || messageData.senderName) {
      customer = await prisma.customer.findFirst({
        where: {
          organizationId: account.organizationId,
          OR: [
            { email: { contains: messageData.senderHandle, mode: 'insensitive' } },
            { name: { contains: messageData.senderName, mode: 'insensitive' } },
          ],
        },
      });
    }

    // Create or update message
    const message = await prisma.socialMessage.upsert({
      where: {
        externalId_platform: {
          externalId: messageData.externalId,
          platform: messageData.platform,
        },
      },
      create: {
        organizationId: account.organizationId,
        accountId: account.id,
        customerId: customer?.id,
        externalId: messageData.externalId,
        threadId: messageData.threadId,
        content: messageData.content,
        mediaUrls: messageData.mediaUrls || [],
        senderName: messageData.senderName,
        senderHandle: messageData.senderHandle,
        senderProfileUrl: messageData.senderProfileUrl,
        platform: messageData.platform,
        messageType: messageData.messageType || 'TEXT',
        direction: 'INBOUND',
        status: 'DELIVERED',
        platformCreatedAt: new Date(messageData.createdAt),
      },
      update: {
        content: messageData.content,
        status: 'DELIVERED',
      },
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('Error processing social webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseWebhookData(data: any): any | null {
  // This would parse different platform webhook formats
  // Each platform has its own webhook structure
  
  // Example for Facebook/Instagram
  if (data.object === 'page' && data.entry) {
    const entry = data.entry[0];
    if (entry.messaging) {
      const messaging = entry.messaging[0];
      return {
        platform: 'FACEBOOK',
        accountId: entry.id,
        externalId: messaging.message?.mid || messaging.timestamp.toString(),
        threadId: messaging.sender.id,
        content: messaging.message?.text || '',
        mediaUrls: messaging.message?.attachments?.map((a: any) => a.payload.url) || [],
        senderName: messaging.sender.name,
        senderHandle: messaging.sender.id,
        messageType: messaging.message?.attachments ? 'IMAGE' : 'TEXT',
        createdAt: new Date(messaging.timestamp).toISOString(),
      };
    }
  }

  // Add parsers for other platforms (Twitter, Instagram, etc.)
  
  return null;
}
