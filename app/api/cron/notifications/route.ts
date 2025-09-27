// Cron job endpoint for processing scheduled notifications
import { NextRequest, NextResponse } from 'next/server';
import { processScheduledNotifications } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Processing scheduled notifications...');
    const startTime = Date.now();

    const result = await processScheduledNotifications();

    const duration = Date.now() - startTime;

    console.log(`Completed notification processing in ${duration}ms:`, result);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering (with authentication)
export async function POST(request: NextRequest) {
  try {
    // For manual triggering, require user authentication
    const body = await request.json();
    const { secret } = body;

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Manual notification processing triggered...');
    const startTime = Date.now();

    const result = await processScheduledNotifications();

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      triggered: 'manual'
    });

  } catch (error) {
    console.error('Manual notification processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
