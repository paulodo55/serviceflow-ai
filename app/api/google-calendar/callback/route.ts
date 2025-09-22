import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService, getGoogleCalendarConfig } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google Calendar auth error:', error);
      return NextResponse.redirect(new URL('/app/calendar?error=auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/app/calendar?error=no_code', request.url));
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    
    // Exchange code for tokens
    const tokens = await calendarService.getTokens(code);
    
    // TODO: Store tokens in database associated with user
    // For now, we'll store in session or return to frontend
    console.log('Google Calendar tokens received:', {
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing'
    });

    // Redirect back to calendar with success
    return NextResponse.redirect(new URL('/app/calendar?success=connected', request.url));
    
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(new URL('/app/calendar?error=callback_failed', request.url));
  }
}
