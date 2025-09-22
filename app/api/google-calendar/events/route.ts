import { NextRequest, NextResponse } from 'next/server';
import { getCalendarService, formatAppointmentForGoogle } from '@/lib/google-calendar-service';
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
    const calendarId = searchParams.get('calendarId') || 'primary';

    const calendarService = getCalendarService();

    const events = await calendarService.getEvents(
      calendarId,
      timeMin || undefined,
      timeMax || undefined,
      maxResults
    );

    return NextResponse.json({ 
      success: true,
      events,
      count: events.length 
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
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

    const { appointment, calendarId = 'primary' } = await request.json();

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment data required' }, { status: 400 });
    }

    const calendarService = getCalendarService();

    // Convert appointment to Google Calendar event format
    const event = formatAppointmentForGoogle(appointment);

    // Create event in Google Calendar
    const createdEvent = await calendarService.createEvent(event, calendarId);

    return NextResponse.json({ 
      success: true, 
      event: createdEvent,
      eventId: createdEvent.id,
      message: 'Appointment created in Google Calendar'
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
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

    const { eventId, calendarId = 'primary', ...updateData } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const calendarService = getCalendarService();
    const updatedEvent = await calendarService.updateEvent(eventId, updateData, calendarId);

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent,
      message: 'Appointment updated in Google Calendar'
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
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
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const calendarService = getCalendarService();
    await calendarService.deleteEvent(eventId, calendarId);

    return NextResponse.json({ 
      success: true,
      message: 'Appointment deleted from Google Calendar'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    );
  }
}
