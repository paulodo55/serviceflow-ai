import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';
import { z } from 'zod';

const sendAlertSchema = z.object({
  subscriptionId: z.string(),
  type: z.enum(['EXPIRATION', 'RENEWAL', 'PAYMENT_DUE', 'TRIAL_ENDING', 'CUSTOM']),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP']).default('EMAIL'),
  scheduledFor: z.string().transform((str) => new Date(str)).optional(),
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const subscriptionId = searchParams.get('subscriptionId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      subscription: {
        organizationId: user.organization.id,
      },
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (subscriptionId) where.subscriptionId = subscriptionId;

    const [alerts, total] = await Promise.all([
      prisma.subscriptionAlert.findMany({
        where,
        include: {
          subscription: {
            select: { id: true, name: true, type: true, status: true },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        skip,
        take: limit,
      }),
      prisma.subscriptionAlert.count({ where }),
    ]);

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
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
    const validatedData = sendAlertSchema.parse(body);

    // Verify subscription belongs to organization
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: validatedData.subscriptionId,
        organizationId: user.organization.id,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const scheduledFor = validatedData.scheduledFor || new Date();
    const sendNow = scheduledFor <= new Date();

    const alert = await prisma.subscriptionAlert.create({
      data: {
        subscriptionId: validatedData.subscriptionId,
        type: validatedData.type,
        subject: validatedData.subject,
        message: validatedData.message,
        channel: validatedData.channel,
        scheduledFor,
        status: sendNow ? 'SENT' : 'PENDING',
        sentAt: sendNow ? new Date() : null,
        recipientEmail: subscription.customer?.email,
        recipientPhone: subscription.customer?.phone,
      },
      include: {
        subscription: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    });

    // Send immediately if scheduled for now or past
    if (sendNow && subscription.customer?.email && validatedData.channel === 'EMAIL') {
      try {
        await sendEmail({
          to: subscription.customer.email,
          subject: validatedData.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #818cf8; padding-bottom: 10px;">
                ${validatedData.subject}
              </h2>
              <div style="margin: 20px 0; line-height: 1.6;">
                ${validatedData.message.replace(/\n/g, '<br>')}
              </div>
              <div style="margin-top: 30px; padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
                <h3 style="color: #818cf8; margin-top: 0;">Subscription Details</h3>
                <p><strong>Name:</strong> ${subscription.name}</p>
                <p><strong>Type:</strong> ${subscription.type}</p>
                <p><strong>Status:</strong> ${subscription.status}</p>
              </div>
              <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                <p>This is an automated message from ${user.organization.name || 'VervidFlow'}</p>
              </div>
            </div>
          `,
          text: `${validatedData.subject}\n\n${validatedData.message}\n\nSubscription: ${subscription.name}\nType: ${subscription.type}\nStatus: ${subscription.status}`,
        });

        await prisma.subscriptionAlert.update({
          where: { id: alert.id },
          data: { status: 'DELIVERED' },
        });
      } catch (emailError) {
        console.error('Error sending alert email:', emailError);
        await prisma.subscriptionAlert.update({
          where: { id: alert.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
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

// Endpoint to process scheduled alerts (to be called by a cron job)
export async function PATCH(request: NextRequest) {
  try {
    // This would typically be called by a cron job with an API key
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const pendingAlerts = await prisma.subscriptionAlert.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        subscription: {
          include: {
            customer: {
              select: { id: true, name: true, email: true, phone: true },
            },
            organization: {
              select: { id: true, name: true },
            },
          },
        },
      },
      take: 50, // Process in batches
    });

    const results = await Promise.allSettled(
      pendingAlerts.map(async (alert) => {
        if (alert.channel === 'EMAIL' && alert.subscription.customer?.email) {
          try {
            await sendEmail({
              to: alert.subscription.customer.email,
              subject: alert.subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #818cf8; padding-bottom: 10px;">
                    ${alert.subject}
                  </h2>
                  <div style="margin: 20px 0; line-height: 1.6;">
                    ${alert.message.replace(/\n/g, '<br>')}
                  </div>
                  <div style="margin-top: 30px; padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
                    <h3 style="color: #818cf8; margin-top: 0;">Subscription Details</h3>
                    <p><strong>Name:</strong> ${alert.subscription.name}</p>
                    <p><strong>Type:</strong> ${alert.subscription.type}</p>
                    <p><strong>Status:</strong> ${alert.subscription.status}</p>
                  </div>
                  <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                    <p>This is an automated message from ${alert.subscription.organization.name || 'VervidFlow'}</p>
                  </div>
                </div>
              `,
              text: `${alert.subject}\n\n${alert.message}\n\nSubscription: ${alert.subscription.name}\nType: ${alert.subscription.type}\nStatus: ${alert.subscription.status}`,
            });

            await prisma.subscriptionAlert.update({
              where: { id: alert.id },
              data: {
                status: 'DELIVERED',
                sentAt: now,
              },
            });

            return { success: true, alertId: alert.id };
          } catch (error) {
            await prisma.subscriptionAlert.update({
              where: { id: alert.id },
              data: { status: 'FAILED' },
            });
            return { success: false, alertId: alert.id, error: error.message };
          }
        } else {
          // Mark as sent for non-email channels (would implement SMS/WhatsApp here)
          await prisma.subscriptionAlert.update({
            where: { id: alert.id },
            data: {
              status: 'SENT',
              sentAt: now,
            },
          });
          return { success: true, alertId: alert.id, channel: alert.channel };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter((r) => r.status === 'rejected' || !r.value.success).length;

    return NextResponse.json({
      message: `Processed ${pendingAlerts.length} alerts`,
      successful,
      failed,
      results: results.map((r) => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }),
    });
  } catch (error) {
    console.error('Error processing scheduled alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
