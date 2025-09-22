import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

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

export interface ServiceAccountConfig {
  client_email: string;
  private_key: string;
  project_id: string;
}

export class GoogleCalendarServiceAccount {
  private jwtClient: JWT;
  private calendar: any;

  constructor(serviceAccount: ServiceAccountConfig) {
    // Create JWT client for service account authentication
    this.jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.jwtClient });
  }

  // Create a new calendar event
  async createEvent(event: CalendarEvent, calendarId: string): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating calendar event:', error);
      throw error;
    }
  }

  // Get events from calendar
  async getEvents(
    calendarId: string,
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

      console.log(`📅 Retrieved ${response.data.items?.length || 0} events`);
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string
  ): Promise<any> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event updated:', eventId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId: string, calendarId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event deleted:', eventId);
    } catch (error) {
      console.error('❌ Error deleting calendar event:', error);
      throw error;
    }
  }

  // Check for scheduling conflicts
  async checkConflicts(
    startTime: string,
    endTime: string,
    calendarId: string,
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

      const hasConflicts = conflicts.length > 0;
      console.log(`🔍 Conflict check: ${hasConflicts ? 'CONFLICTS FOUND' : 'NO CONFLICTS'}`);
      
      return hasConflicts;
    } catch (error) {
      console.error('❌ Error checking conflicts:', error);
      return false;
    }
  }

  // Get available time slots
  async getAvailableSlots(
    date: string,
    duration: number, // in minutes
    workingHours: { start: string; end: string } = { start: '09:00', end: '17:00' },
    calendarId: string
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

      console.log(`📅 Found ${availableSlots.length} available slots for ${date}`);
      return availableSlots;
    } catch (error) {
      console.error('❌ Error getting available slots:', error);
      return [];
    }
  }

  // Create a dedicated calendar for ServiceFlow
  async createServiceFlowCalendar(businessName: string): Promise<string> {
    try {
      const response = await this.calendar.calendars.insert({
        requestBody: {
          summary: `${businessName} - ServiceFlow Appointments`,
          description: `ServiceFlow CRM appointments for ${businessName}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      const calendarId = response.data.id;
      console.log('✅ ServiceFlow calendar created:', calendarId);
      
      return calendarId;
    } catch (error) {
      console.error('❌ Error creating ServiceFlow calendar:', error);
      throw error;
    }
  }

  // Share calendar with business owner
  async shareCalendar(calendarId: string, ownerEmail: string): Promise<void> {
    try {
      await this.calendar.acl.insert({
        calendarId,
        requestBody: {
          role: 'owner',
          scope: {
            type: 'user',
            value: ownerEmail
          }
        }
      });

      console.log(`✅ Calendar shared with owner: ${ownerEmail}`);
    } catch (error) {
      console.error('❌ Error sharing calendar:', error);
      throw error;
    }
  }
}

// Utility functions
export const formatAppointmentForGoogle = (appointment: any): CalendarEvent => {
  return {
    summary: `${appointment.service} - ${appointment.customerName}`,
    description: `
📋 SERVICE DETAILS:
Service: ${appointment.service}
Duration: ${appointment.duration || '1 hour'}
Price: $${appointment.price || 'TBD'}

👤 CUSTOMER INFO:
Name: ${appointment.customerName}
Phone: ${appointment.customerPhone}
Email: ${appointment.customerEmail}

📝 NOTES:
${appointment.notes || 'No additional notes'}

🏢 ServiceFlow CRM
Powered by ServiceFlow - Professional Service Management
    `.trim(),
    start: {
      dateTime: `${appointment.date}T${appointment.startTime}:00`,
      timeZone: appointment.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: `${appointment.date}T${appointment.endTime}:00`,
      timeZone: appointment.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    attendees: [
      {
        email: appointment.customerEmail,
        displayName: appointment.customerName
      }
    ],
    location: appointment.address || appointment.location,
    status: 'confirmed'
  };
};

// Environment configuration
export const getServiceAccountConfig = (): ServiceAccountConfig => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
      project_id: serviceAccount.project_id
    };
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format');
  }
};

// Create singleton instance
let calendarServiceInstance: GoogleCalendarServiceAccount | null = null;

export const getCalendarService = (): GoogleCalendarServiceAccount => {
  if (!calendarServiceInstance) {
    const config = getServiceAccountConfig();
    calendarServiceInstance = new GoogleCalendarServiceAccount(config);
  }
  return calendarServiceInstance;
};
