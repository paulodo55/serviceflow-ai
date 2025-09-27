import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePrivacySettingSchema = z.object({
  settingKey: z.string().min(1, 'Setting key is required'),
  settingValue: z.any(),
  description: z.string().optional(),
  isGDPRRelated: z.boolean().default(false),
  requiresConsent: z.boolean().default(false),
  userId: z.string().optional(), // If null, applies to organization
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
    const userId = searchParams.get('userId');
    const isGDPRRelated = searchParams.get('isGDPRRelated');
    const requiresConsent = searchParams.get('requiresConsent');

    const where: any = {
      organizationId: user.organization.id,
    };

    // Users can only see their own settings unless they're admin
    if (user.role === 'STAFF' && !userId) {
      where.userId = user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (isGDPRRelated !== null) where.isGDPRRelated = isGDPRRelated === 'true';
    if (requiresConsent !== null) where.requiresConsent = requiresConsent === 'true';

    const settings = await prisma.privacySetting.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { settingKey: 'asc' },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
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
    const validatedData = updatePrivacySettingSchema.parse(body);

    // Users can only update their own settings unless they're admin
    const targetUserId = validatedData.userId || user.id;
    if (user.role === 'STAFF' && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const setting = await prisma.privacySetting.upsert({
      where: {
        organizationId_userId_settingKey: {
          organizationId: user.organization.id,
          userId: targetUserId,
          settingKey: validatedData.settingKey,
        },
      },
      create: {
        organizationId: user.organization.id,
        userId: targetUserId,
        settingKey: validatedData.settingKey,
        settingValue: validatedData.settingValue,
        description: validatedData.description,
        isGDPRRelated: validatedData.isGDPRRelated,
        requiresConsent: validatedData.requiresConsent,
        consentGivenAt: validatedData.requiresConsent ? new Date() : null,
      },
      update: {
        settingValue: validatedData.settingValue,
        description: validatedData.description,
        isGDPRRelated: validatedData.isGDPRRelated,
        requiresConsent: validatedData.requiresConsent,
        consentGivenAt: validatedData.requiresConsent ? new Date() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error updating privacy setting:', error);
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

// Bulk update privacy settings
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
    const { settings, userId } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 });
    }

    const targetUserId = userId || user.id;
    if (user.role === 'STAFF' && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updatedSettings = await Promise.all(
      settings.map(async (settingData: any) => {
        return await prisma.privacySetting.upsert({
          where: {
            organizationId_userId_settingKey: {
              organizationId: user.organization.id,
              userId: targetUserId,
              settingKey: settingData.settingKey,
            },
          },
          create: {
            organizationId: user.organization.id,
            userId: targetUserId,
            settingKey: settingData.settingKey,
            settingValue: settingData.settingValue,
            description: settingData.description,
            isGDPRRelated: settingData.isGDPRRelated || false,
            requiresConsent: settingData.requiresConsent || false,
            consentGivenAt: settingData.requiresConsent ? new Date() : null,
          },
          update: {
            settingValue: settingData.settingValue,
            description: settingData.description,
            consentGivenAt: settingData.requiresConsent ? new Date() : null,
          },
        });
      })
    );

    return NextResponse.json({
      message: `${updatedSettings.length} privacy settings updated`,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error bulk updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Initialize default privacy settings
export async function PUT(request: NextRequest) {
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

    const defaultSettings = [
      {
        settingKey: 'data_processing_consent',
        settingValue: { consent: false, timestamp: null },
        description: 'Consent for processing personal data',
        isGDPRRelated: true,
        requiresConsent: true,
      },
      {
        settingKey: 'marketing_communications',
        settingValue: { email: false, sms: false, phone: false },
        description: 'Marketing communication preferences',
        isGDPRRelated: true,
        requiresConsent: true,
      },
      {
        settingKey: 'data_sharing_third_parties',
        settingValue: { consent: false, partners: [] },
        description: 'Consent for sharing data with third parties',
        isGDPRRelated: true,
        requiresConsent: true,
      },
      {
        settingKey: 'profile_visibility',
        settingValue: { public: false, employees: true, managers: true },
        description: 'Profile visibility settings',
        isGDPRRelated: false,
        requiresConsent: false,
      },
      {
        settingKey: 'activity_tracking',
        settingValue: { enabled: true, analytics: false },
        description: 'Activity and usage tracking',
        isGDPRRelated: true,
        requiresConsent: true,
      },
      {
        settingKey: 'data_retention',
        settingValue: { period: '7years', autoDelete: false },
        description: 'Data retention preferences',
        isGDPRRelated: true,
        requiresConsent: false,
      },
      {
        settingKey: 'cookie_preferences',
        settingValue: { necessary: true, functional: false, analytics: false, marketing: false },
        description: 'Cookie usage preferences',
        isGDPRRelated: true,
        requiresConsent: true,
      },
      {
        settingKey: 'notification_preferences',
        settingValue: { email: true, sms: false, push: true, inApp: true },
        description: 'Notification delivery preferences',
        isGDPRRelated: false,
        requiresConsent: false,
      },
    ];

    const createdSettings = await Promise.all(
      defaultSettings.map(async (settingData) => {
        return await prisma.privacySetting.upsert({
          where: {
            organizationId_userId_settingKey: {
              organizationId: user.organization.id,
              userId: user.id,
              settingKey: settingData.settingKey,
            },
          },
          create: {
            organizationId: user.organization.id,
            userId: user.id,
            ...settingData,
          },
          update: {}, // Don't overwrite existing settings
        });
      })
    );

    return NextResponse.json({
      message: 'Default privacy settings initialized',
      settings: createdSettings,
    });
  } catch (error) {
    console.error('Error initializing privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
