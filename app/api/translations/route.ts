import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTranslationSchema = z.object({
  languageId: z.string().min(1, 'Language ID is required'),
  key: z.string().min(1, 'Translation key is required'),
  value: z.string().min(1, 'Translation value is required'),
  context: z.string().optional(),
});

const bulkTranslationSchema = z.object({
  languageId: z.string().min(1, 'Language ID is required'),
  translations: z.array(z.object({
    key: z.string().min(1, 'Translation key is required'),
    value: z.string().min(1, 'Translation value is required'),
    context: z.string().optional(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get('languageId');
    const languageCode = searchParams.get('languageCode');
    const key = searchParams.get('key');
    const isApproved = searchParams.get('isApproved');

    let where: any = {};

    if (languageId) {
      where.languageId = languageId;
    } else if (languageCode) {
      where.language = { code: languageCode };
    }

    if (key) where.key = { contains: key, mode: 'insensitive' };
    if (isApproved !== null) where.isApproved = isApproved === 'true';

    const translations = await prisma.translation.findMany({
      where,
      include: {
        language: {
          select: { id: true, code: true, name: true, nativeName: true },
        },
      },
      orderBy: [
        { key: 'asc' },
        { language: { name: 'asc' } },
      ],
    });

    // If requesting for a specific language, format as key-value pairs
    if (languageCode || languageId) {
      const translationMap = translations.reduce((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({ 
        translations: translationMap,
        language: translations[0]?.language,
      });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Error fetching translations:', error);
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

    const body = await request.json();
    
    // Check if it's a bulk operation
    if (body.translations && Array.isArray(body.translations)) {
      const validatedData = bulkTranslationSchema.parse(body);
      
      // Create or update translations in bulk
      const results = await Promise.all(
        validatedData.translations.map(translation =>
          prisma.translation.upsert({
            where: {
              languageId_key: {
                languageId: validatedData.languageId,
                key: translation.key,
              },
            },
            create: {
              languageId: validatedData.languageId,
              key: translation.key,
              value: translation.value,
              context: translation.context,
            },
            update: {
              value: translation.value,
              context: translation.context,
            },
            include: {
              language: {
                select: { id: true, code: true, name: true },
              },
            },
          })
        )
      );

      return NextResponse.json({ 
        message: `${results.length} translations processed successfully`,
        translations: results,
      }, { status: 201 });
    } else {
      // Single translation
      const validatedData = createTranslationSchema.parse(body);

      const translation = await prisma.translation.upsert({
        where: {
          languageId_key: {
            languageId: validatedData.languageId,
            key: validatedData.key,
          },
        },
        create: validatedData,
        update: {
          value: validatedData.value,
          context: validatedData.context,
        },
        include: {
          language: {
            select: { id: true, code: true, name: true },
          },
        },
      });

      return NextResponse.json(translation, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating translation:', error);
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

// Seed default English translations
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get English language
    const englishLang = await prisma.language.findUnique({
      where: { code: 'en' },
    });

    if (!englishLang) {
      return NextResponse.json({ error: 'English language not found' }, { status: 404 });
    }

    const defaultTranslations = [
      // Navigation
      { key: 'nav.dashboard', value: 'Dashboard', context: 'Navigation menu' },
      { key: 'nav.calendar', value: 'Calendar', context: 'Navigation menu' },
      { key: 'nav.customers', value: 'Customers', context: 'Navigation menu' },
      { key: 'nav.messages', value: 'Messages', context: 'Navigation menu' },
      { key: 'nav.invoices', value: 'Invoices', context: 'Navigation menu' },
      { key: 'nav.reviews', value: 'Reviews', context: 'Navigation menu' },
      { key: 'nav.analytics', value: 'Analytics', context: 'Navigation menu' },
      { key: 'nav.settings', value: 'Settings', context: 'Navigation menu' },
      { key: 'nav.subscriptions', value: 'Subscriptions', context: 'Navigation menu' },
      { key: 'nav.contracts', value: 'Contracts', context: 'Navigation menu' },
      { key: 'nav.social', value: 'Social Inbox', context: 'Navigation menu' },
      { key: 'nav.integrations', value: 'Integrations', context: 'Navigation menu' },
      { key: 'nav.banking', value: 'Banking', context: 'Navigation menu' },
      { key: 'nav.privacy', value: 'Privacy & Data', context: 'Navigation menu' },

      // Common actions
      { key: 'action.save', value: 'Save', context: 'Button text' },
      { key: 'action.cancel', value: 'Cancel', context: 'Button text' },
      { key: 'action.delete', value: 'Delete', context: 'Button text' },
      { key: 'action.edit', value: 'Edit', context: 'Button text' },
      { key: 'action.create', value: 'Create', context: 'Button text' },
      { key: 'action.update', value: 'Update', context: 'Button text' },
      { key: 'action.search', value: 'Search', context: 'Button text' },
      { key: 'action.filter', value: 'Filter', context: 'Button text' },
      { key: 'action.export', value: 'Export', context: 'Button text' },
      { key: 'action.import', value: 'Import', context: 'Button text' },
      { key: 'action.send', value: 'Send', context: 'Button text' },
      { key: 'action.reply', value: 'Reply', context: 'Button text' },

      // Status labels
      { key: 'status.active', value: 'Active', context: 'Status label' },
      { key: 'status.inactive', value: 'Inactive', context: 'Status label' },
      { key: 'status.pending', value: 'Pending', context: 'Status label' },
      { key: 'status.completed', value: 'Completed', context: 'Status label' },
      { key: 'status.cancelled', value: 'Cancelled', context: 'Status label' },
      { key: 'status.expired', value: 'Expired', context: 'Status label' },
      { key: 'status.paid', value: 'Paid', context: 'Status label' },
      { key: 'status.unpaid', value: 'Unpaid', context: 'Status label' },
      { key: 'status.overdue', value: 'Overdue', context: 'Status label' },

      // Form labels
      { key: 'form.name', value: 'Name', context: 'Form field label' },
      { key: 'form.email', value: 'Email', context: 'Form field label' },
      { key: 'form.phone', value: 'Phone', context: 'Form field label' },
      { key: 'form.address', value: 'Address', context: 'Form field label' },
      { key: 'form.description', value: 'Description', context: 'Form field label' },
      { key: 'form.amount', value: 'Amount', context: 'Form field label' },
      { key: 'form.date', value: 'Date', context: 'Form field label' },
      { key: 'form.time', value: 'Time', context: 'Form field label' },
      { key: 'form.title', value: 'Title', context: 'Form field label' },
      { key: 'form.message', value: 'Message', context: 'Form field label' },

      // Messages
      { key: 'message.success', value: 'Operation completed successfully', context: 'Success message' },
      { key: 'message.error', value: 'An error occurred. Please try again.', context: 'Error message' },
      { key: 'message.loading', value: 'Loading...', context: 'Loading message' },
      { key: 'message.no_data', value: 'No data available', context: 'Empty state message' },
      { key: 'message.confirm_delete', value: 'Are you sure you want to delete this item?', context: 'Confirmation message' },

      // Time/Date
      { key: 'time.now', value: 'Now', context: 'Time reference' },
      { key: 'time.today', value: 'Today', context: 'Time reference' },
      { key: 'time.yesterday', value: 'Yesterday', context: 'Time reference' },
      { key: 'time.tomorrow', value: 'Tomorrow', context: 'Time reference' },
      { key: 'time.this_week', value: 'This week', context: 'Time reference' },
      { key: 'time.last_week', value: 'Last week', context: 'Time reference' },
      { key: 'time.this_month', value: 'This month', context: 'Time reference' },
      { key: 'time.last_month', value: 'Last month', context: 'Time reference' },

      // Customer communication templates
      { key: 'template.welcome', value: 'Welcome to our service! We\'re excited to have you.', context: 'Welcome message template' },
      { key: 'template.appointment_reminder', value: 'Reminder: You have an appointment scheduled for {date} at {time}.', context: 'Appointment reminder template' },
      { key: 'template.payment_confirmation', value: 'Thank you for your payment of {amount}. Your transaction ID is {id}.', context: 'Payment confirmation template' },
      { key: 'template.subscription_expiring', value: 'Your subscription will expire on {date}. Please renew to continue service.', context: 'Subscription expiry template' },
    ];

    const results = await Promise.all(
      defaultTranslations.map(translation =>
        prisma.translation.upsert({
          where: {
            languageId_key: {
              languageId: englishLang.id,
              key: translation.key,
            },
          },
          create: {
            languageId: englishLang.id,
            ...translation,
            isApproved: true,
          },
          update: {
            ...translation,
            isApproved: true,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Default English translations created successfully',
      count: results.length,
    });
  } catch (error) {
    console.error('Error creating default translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
