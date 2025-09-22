import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService, getGoogleCalendarConfig } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    
    const authUrl = calendarService.getAuthUrl();
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google Calendar auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
