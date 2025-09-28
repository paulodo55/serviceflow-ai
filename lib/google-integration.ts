import { google } from 'googleapis';
import { prisma } from './prisma';
import { realtimeEvents } from './websocket';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: Array<{ event: string; error: string }>;
  conflicts: Array<{ localId: string; googleId: string; resolution: string }>;
}

export class GoogleCalendarService {
  private calendar: any;

  constructor(private accessToken: string, private refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  // Sync appointments to Google Calendar
  async syncAppointmentsToGoogle(organizationId: string): Promise<SyncResult> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          organizationId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          googleCalendarEventId: null // Only sync appointments not yet in Google Calendar
        },
        include: {
          customer: {
            select: { name: true, email: true, phone: true }
          },
          assignedUser: {
            select: { name: true, email: true }
          }
        }
      });

      const result: SyncResult = {
        success: true,
        synced: 0,
        errors: [],
        conflicts: []
      };

      for (const appointment of appointments) {
        try {
          const event = await this.createGoogleCalendarEvent({
            id: appointment.id,
            summary: `${appointment.title} - ${appointment.customer.name}`,
            description: this.formatEventDescription(appointment),
            start: {
              dateTime: appointment.startTime.toISOString(),
              timeZone: 'America/New_York' // TODO: Get from organization settings
            },
            end: {
              dateTime: appointment.endTime.toISOString(),
              timeZone: 'America/New_York'
            },
            location: appointment.location || '',
            attendees: this.formatAttendees(appointment)
          });

          // Update appointment with Google Calendar event ID
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { googleCalendarEventId: event.id }
          });

          result.synced++;

        } catch (error) {
          result.errors.push({
            event: `${appointment.title} (${appointment.id})`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;

    } catch (error) {
      console.error('Error syncing appointments to Google Calendar:', error);
      return {
        success: false,
        synced: 0,
        errors: [{ event: 'Sync process', error: error instanceof Error ? error.message : 'Unknown error' }],
        conflicts: []
      };
    }
  }

  // Sync events from Google Calendar
  async syncEventsFromGoogle(organizationId: string, calendarId: string = 'primary'): Promise<SyncResult> {
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: oneMonthAgo.toISOString(),
        timeMax: threeMonthsFromNow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];
      const result: SyncResult = {
        success: true,
        synced: 0,
        errors: [],
        conflicts: []
      };

      for (const event of events) {
        try {
          // Skip events that don't have start/end times or are all-day events
          if (!event.start?.dateTime || !event.end?.dateTime) {
            continue;
          }

          // Check if we already have this event
          const existingAppointment = await prisma.appointment.findFirst({
            where: {
              organizationId,
              googleCalendarEventId: event.id
            }
          });

          if (existingAppointment) {
            // Update existing appointment if modified
            if (new Date(event.updated!) > existingAppointment.updatedAt) {
              await this.updateAppointmentFromGoogleEvent(existingAppointment.id, event);
              result.synced++;
            }
          } else {
            // Create new appointment from Google event
            await this.createAppointmentFromGoogleEvent(organizationId, event);
            result.synced++;
          }

        } catch (error) {
          result.errors.push({
            event: `${event.summary} (${event.id})`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;

    } catch (error) {
      console.error('Error syncing events from Google Calendar:', error);
      return {
        success: false,
        synced: 0,
        errors: [{ event: 'Sync process', error: error instanceof Error ? error.message : 'Unknown error' }],
        conflicts: []
      };
    }
  }

  // Create a Google Calendar event
  async createGoogleCalendarEvent(eventData: GoogleCalendarEvent): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData
      });

      return response.data;

    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }

  // Update a Google Calendar event
  async updateGoogleCalendarEvent(eventId: string, eventData: Partial<GoogleCalendarEvent>): Promise<any> {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: eventData
      });

      return response.data;

    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }

  // Delete a Google Calendar event
  async deleteGoogleCalendarEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId
      });

    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }

  // Private helper methods
  private formatEventDescription(appointment: any): string {
    const parts = [];
    
    if (appointment.description) {
      parts.push(appointment.description);
    }

    parts.push(`Customer: ${appointment.customer.name}`);
    
    if (appointment.customer.phone) {
      parts.push(`Phone: ${appointment.customer.phone}`);
    }

    if (appointment.assignedUser) {
      parts.push(`Technician: ${appointment.assignedUser.name}`);
    }

    if (appointment.notes) {
      parts.push(`Notes: ${appointment.notes}`);
    }

    return parts.join('\n\n');
  }

  private formatAttendees(appointment: any): Array<{ email: string; displayName?: string }> {
    const attendees = [];

    if (appointment.customer.email) {
      attendees.push({
        email: appointment.customer.email,
        displayName: appointment.customer.name
      });
    }

    if (appointment.assignedUser?.email) {
      attendees.push({
        email: appointment.assignedUser.email,
        displayName: appointment.assignedUser.name
      });
    }

    return attendees;
  }

  private async createAppointmentFromGoogleEvent(organizationId: string, event: any): Promise<void> {
    // Find or create customer based on attendees
    let customerId = await this.findOrCreateCustomerFromEvent(organizationId, event);

    if (!customerId) {
      // Create a generic customer for external events
      const customer = await prisma.customer.create({
        data: {
          organizationId,
          name: event.summary || 'External Event',
          email: event.creator?.email || '',
          source: 'GOOGLE_CALENDAR',
          status: 'ACTIVE',
          customerType: 'RESIDENTIAL'
        }
      });
      customerId = customer.id;
    }

    await prisma.appointment.create({
      data: {
        organizationId,
        customerId,
        title: event.summary || 'Imported Event',
        description: event.description || '',
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        location: event.location || '',
        status: 'SCHEDULED',
        type: 'OTHER',
        googleCalendarEventId: event.id,
        estimatedDuration: Math.round((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000)
      }
    });
  }

  private async updateAppointmentFromGoogleEvent(appointmentId: string, event: any): Promise<void> {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        title: event.summary || 'Imported Event',
        description: event.description || '',
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        location: event.location || '',
        estimatedDuration: Math.round((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000)
      }
    });
  }

  private async findOrCreateCustomerFromEvent(organizationId: string, event: any): Promise<string | null> {
    if (!event.attendees || event.attendees.length === 0) {
      return null;
    }

    // Try to find existing customer by email
    for (const attendee of event.attendees) {
      if (attendee.email) {
        const customer = await prisma.customer.findFirst({
          where: {
            organizationId,
            email: attendee.email
          }
        });

        if (customer) {
          return customer.id;
        }
      }
    }

    return null;
  }
}

// Stripe Integration
export class StripeService {
  private stripe: any;

  constructor() {
    const Stripe = require('stripe');
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Create a customer
  async createCustomer(customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: any;
  }): Promise<any> {
    try {
      return await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address
      });

    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create a payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string): Promise<any> {
    try {
      const paymentIntentData: any = {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true
        }
      };

      if (customerId) {
        paymentIntentData.customer = customerId;
      }

      return await this.stripe.paymentIntents.create(paymentIntentData);

    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(customerId: string, priceId: string): Promise<any> {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(signature: string, payload: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePayment(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    // Update invoice status if payment is for an invoice
    if (paymentIntent.metadata?.invoiceId) {
      await prisma.invoice.update({
        where: { id: paymentIntent.metadata.invoiceId },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          paymentMethods: { card: 'CARD' },
          paymentReference: paymentIntent.id
        }
      });

      // Emit real-time event
      const invoice = await prisma.invoice.findUnique({
        where: { id: paymentIntent.metadata.invoiceId },
        include: { customer: true }
      });

      if (invoice) {
        realtimeEvents.invoicePaid(invoice.organizationId, invoice);
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    // Handle payment failure - could send notifications, update status, etc.
    console.log('Payment failed:', paymentIntent.id);
  }

  private async handleInvoicePayment(invoice: any): Promise<void> {
    // Handle subscription invoice payments
    console.log('Invoice paid:', invoice.id);
  }

  private async handleSubscriptionUpdate(subscription: any): Promise<void> {
    // Handle subscription updates
    console.log('Subscription updated:', subscription.id);
  }
}

// Export services
export const googleCalendarService = {
  getInstance: (accessToken: string, refreshToken: string) => 
    new GoogleCalendarService(accessToken, refreshToken)
};

export const stripeService = new StripeService();
