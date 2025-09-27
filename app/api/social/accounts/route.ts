import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const connectAccountSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'WHATSAPP']),
  accountId: z.string().min(1, 'Account ID is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().transform((str) => new Date(str)).optional(),
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
    const isActive = searchParams.get('isActive');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (platform) where.platform = platform;
    if (isActive !== null) where.isActive = isActive === 'true';

    const accounts = await prisma.socialMediaAccount.findMany({
      where,
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose sensitive tokens in response
    const safeAccounts = accounts.map(account => ({
      ...account,
      accessToken: account.accessToken ? '[HIDDEN]' : null,
      refreshToken: account.refreshToken ? '[HIDDEN]' : null,
    }));

    return NextResponse.json({ accounts: safeAccounts });
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
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
    const validatedData = connectAccountSchema.parse(body);

    // Check if account already exists
    const existingAccount = await prisma.socialMediaAccount.findFirst({
      where: {
        organizationId: user.organization.id,
        platform: validatedData.platform,
        accountId: validatedData.accountId,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already connected' },
        { status: 409 }
      );
    }

    // Create webhook URL for this account
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/social/webhook/${validatedData.platform.toLowerCase()}`;
    const webhookSecret = generateWebhookSecret();

    const account = await prisma.socialMediaAccount.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        webhookUrl,
        webhookSecret,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    // Don't expose sensitive data
    const safeAccount = {
      ...account,
      accessToken: '[HIDDEN]',
      refreshToken: account.refreshToken ? '[HIDDEN]' : null,
      webhookSecret: '[HIDDEN]',
    };

    return NextResponse.json(safeAccount, { status: 201 });
  } catch (error) {
    console.error('Error connecting social media account:', error);
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

function generateWebhookSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
