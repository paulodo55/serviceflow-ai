import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService, getGoogleCalendarConfig, formatEventForGoogle } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    // TODO: Get user's stored tokens from database
    const tokens = null; // Replace with actual token retrieval
    
    if (!tokens) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    calendarService.setTokens(tokens);

    const events = await calendarService.getEvents(
      'primary',
      timeMin || undefined,
      timeMax || undefined,
      maxResults
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = await request.json();

    // TODO: Get user's stored tokens from database
    const tokens = null; // Replace with actual token retrieval
    
    if (!tokens) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    calendarService.setTokens(tokens);

    // Convert appointment to Google Calendar event format
    const event = formatEventForGoogle(appointment);

    // Create event in Google Calendar
    const createdEvent = await calendarService.createEvent(event);

    return NextResponse.json({ 
      success: true, 
      event: createdEvent,
      message: 'Appointment created in Google Calendar'
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, ...updateData } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // TODO: Get user's stored tokens from database
    const tokens = null; // Replace with actual token retrieval
    
    if (!tokens) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    calendarService.setTokens(tokens);

    const updatedEvent = await calendarService.updateEvent(eventId, updateData);

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent,
      message: 'Appointment updated in Google Calendar'
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // TODO: Get user's stored tokens from database
    const tokens = null; // Replace with actual token retrieval
    
    if (!tokens) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const config = getGoogleCalendarConfig();
    const calendarService = new GoogleCalendarService(config);
    calendarService.setTokens(tokens);

    await calendarService.deleteEvent(eventId);

    return NextResponse.json({ 
      success: true,
      message: 'Appointment deleted from Google Calendar'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
