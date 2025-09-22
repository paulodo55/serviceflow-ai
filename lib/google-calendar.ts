import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Types
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor(config: CalendarConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate OAuth URL for user authentication
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Set tokens for authenticated requests
  setTokens(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Create a new calendar event
  async createEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: 'all' // Send email notifications
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Get events from calendar
  async getEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 50
  ): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<any> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get user's calendars
  async getCalendars(): Promise<any[]> {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw error;
    }
  }

  // Create a new calendar
  async createCalendar(summary: string, description?: string): Promise<any> {
    try {
      const response = await this.calendar.calendars.insert({
        requestBody: {
          summary,
          description,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw error;
    }
  }

  // Check for scheduling conflicts
  async checkConflicts(
    startTime: string,
    endTime: string,
    calendarId: string = 'primary',
    excludeEventId?: string
  ): Promise<boolean> {
    try {
      const events = await this.getEvents(calendarId, startTime, endTime);
      
      const conflicts = events.filter(event => {
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }
        
        const eventStart = new Date(event.start?.dateTime || event.start?.date);
        const eventEnd = new Date(event.end?.dateTime || event.end?.date);
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        return (newStart < eventEnd && newEnd > eventStart);
      });

      return conflicts.length > 0;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    }
  }

  // Get available time slots
  async getAvailableSlots(
    date: string,
    duration: number, // in minutes
    workingHours: { start: string; end: string } = { start: '09:00', end: '17:00' },
    calendarId: string = 'primary'
  ): Promise<Array<{ start: string; end: string }>> {
    try {
      const startOfDay = new Date(`${date}T${workingHours.start}:00`);
      const endOfDay = new Date(`${date}T${workingHours.end}:00`);

      const events = await this.getEvents(
        calendarId,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      const availableSlots: Array<{ start: string; end: string }> = [];
      let currentTime = new Date(startOfDay);

      while (currentTime < endOfDay) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        if (slotEnd > endOfDay) break;

        const hasConflict = events.some(event => {
          const eventStart = new Date(event.start?.dateTime || event.start?.date);
          const eventEnd = new Date(event.end?.dateTime || event.end?.date);
          return (currentTime < eventEnd && slotEnd > eventStart);
        });

        if (!hasConflict) {
          availableSlots.push({
            start: currentTime.toISOString(),
            end: slotEnd.toISOString()
          });
        }

        currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
      }

      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
}

// Utility functions
export const formatEventForGoogle = (appointment: any): CalendarEvent => {
  return {
    summary: `${appointment.service} - ${appointment.customerName}`,
    description: `
Service: ${appointment.service}
Customer: ${appointment.customerName}
Phone: ${appointment.customerPhone}
Email: ${appointment.customerEmail}
Notes: ${appointment.notes || 'No additional notes'}
    `.trim(),
    start: {
      dateTime: `${appointment.date}T${appointment.startTime}:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: `${appointment.date}T${appointment.endTime}:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    attendees: [
      {
        email: appointment.customerEmail,
        displayName: appointment.customerName
      }
    ],
    location: appointment.address,
    status: 'confirmed'
  };
};

export const parseGoogleEvent = (event: any) => {
  return {
    id: event.id,
    title: event.summary,
    description: event.description,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    location: event.location,
    attendees: event.attendees?.map((attendee: any) => ({
      email: attendee.email,
      name: attendee.displayName,
      status: attendee.responseStatus
    })) || [],
    status: event.status,
    created: event.created,
    updated: event.updated
  };
};

// Environment configuration
export const getGoogleCalendarConfig = (): CalendarConfig => {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
  };
};
