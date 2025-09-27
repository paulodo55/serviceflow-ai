// Notification service for VervidFlow - handles automated SMS and email notifications
import smsService from './sms-service';
import emailService from './email-service-enhanced';
import { renderEmailTemplate } from './email-templates';
import { renderSMSTemplate } from './sms-templates';
import { prisma } from './prisma';

export interface NotificationPreferences {
  smsEnabled: boolean;
  emailEnabled: boolean;
  appointmentReminders: boolean;
  paymentConfirmations: boolean;
  subscriptionAlerts: boolean;
  marketingMessages: boolean;
}

export interface NotificationContext {
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  businessName: string;
  appointmentId?: string;
  appointmentDate?: string;
  serviceName?: string;
  amount?: string;
  subscriptionName?: string;
  daysUntilExpiration?: number;
}

// Send appointment reminder (both SMS and Email)
export const sendAppointmentReminder = async (context: NotificationContext): Promise<{ sms: boolean; email: boolean }> => {
  const results = { sms: false, email: false };

  try {
    // Get customer preferences if customerId is provided
    let preferences: NotificationPreferences = {
      smsEnabled: true,
      emailEnabled: true,
      appointmentReminders: true,
      paymentConfirmations: true,
      subscriptionAlerts: true,
      marketingMessages: false
    };

    if (context.customerId) {
      // TODO: Fetch from database when we have a preferences table
      // const customerPrefs = await prisma.customerPreferences.findUnique({ where: { customerId: context.customerId } });
    }

    // Send SMS reminder if enabled and phone number available
    if (preferences.smsEnabled && preferences.appointmentReminders && context.customerPhone && context.appointmentDate) {
      try {
        const smsTemplate = createAppointmentReminder(
          context.customerName,
          context.appointmentDate,
          context.businessName
        );
        smsTemplate.to = context.customerPhone;

        const smsResult = await sendSMS(smsTemplate);
        results.sms = smsResult.success;

        // Log the notification
        if (context.customerId) {
          await logNotification({
            customerId: context.customerId,
            type: 'sms',
            purpose: 'appointment_reminder',
            recipient: context.customerPhone,
            content: smsTemplate.message,
            status: smsResult.success ? 'sent' : 'failed',
            appointmentId: context.appointmentId
          });
        }
      } catch (error) {
        console.error('Error sending SMS reminder:', error);
      }
    }

    // Send email reminder if enabled and email available
    if (preferences.emailEnabled && preferences.appointmentReminders && context.customerEmail && context.appointmentDate) {
      try {
        const emailTemplate = createAppointmentReminderEmail(
          context.customerName,
          context.appointmentDate,
          context.businessName,
          context.customerEmail
        );

        const emailResult = await sendEmail(emailTemplate);
        results.email = emailResult;

        // Log the notification
        if (context.customerId) {
          await logNotification({
            customerId: context.customerId,
            type: 'email',
            purpose: 'appointment_reminder',
            recipient: context.customerEmail,
            content: emailTemplate.subject,
            status: emailResult ? 'sent' : 'failed',
            appointmentId: context.appointmentId
          });
        }
      } catch (error) {
        console.error('Error sending email reminder:', error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error in sendAppointmentReminder:', error);
    return results;
  }
};

// Send booking confirmation
export const sendBookingConfirmation = async (context: NotificationContext): Promise<{ sms: boolean; email: boolean }> => {
  const results = { sms: false, email: false };

  try {
    // Send SMS confirmation
    if (context.customerPhone && context.appointmentDate) {
      const smsTemplate = createBookingConfirmation(
        context.customerName,
        context.appointmentDate,
        context.businessName
      );
      smsTemplate.to = context.customerPhone;

      const smsResult = await sendSMS(smsTemplate);
      results.sms = smsResult.success;
    }

    // Send email confirmation
    if (context.customerEmail && context.appointmentDate) {
      const emailTemplate = {
        to: context.customerEmail,
        subject: `Appointment Confirmed - ${context.businessName}`,
        html: `
          <h1>Appointment Confirmed!</h1>
          <p>Hi ${context.customerName},</p>
          <p>Your appointment has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <strong>Date & Time:</strong> ${context.appointmentDate}<br>
            <strong>Service:</strong> ${context.serviceName || 'Service'}<br>
            <strong>Location:</strong> ${context.businessName}
          </div>
          <p>We'll send you a reminder 24 hours before your appointment.</p>
          <p>See you soon!</p>
        `,
        text: `Appointment Confirmed! Hi ${context.customerName}, your appointment with ${context.businessName} is confirmed for ${context.appointmentDate}.`
      };

      const emailResult = await sendEmail(emailTemplate);
      results.email = emailResult;
    }

    return results;
  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
    return results;
  }
};

// Send payment confirmation
export const sendPaymentConfirmation = async (context: NotificationContext): Promise<{ sms: boolean; email: boolean }> => {
  const results = { sms: false, email: false };

  try {
    if (!context.amount) return results;

    // Send SMS confirmation
    if (context.customerPhone) {
      const smsTemplate = createPaymentConfirmation(
        context.customerName,
        context.amount,
        context.businessName
      );
      smsTemplate.to = context.customerPhone;

      const smsResult = await sendSMS(smsTemplate);
      results.sms = smsResult.success;
    }

    // Send email confirmation
    if (context.customerEmail) {
      const emailTemplate = {
        to: context.customerEmail,
        subject: `Payment Receipt - ${context.businessName}`,
        html: `
          <h1>Payment Receipt</h1>
          <p>Hi ${context.customerName},</p>
          <p>Thank you for your payment! Here are the details:</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <strong>Amount:</strong> $${context.amount}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Business:</strong> ${context.businessName}
          </div>
          <p>This receipt serves as confirmation of your payment.</p>
          <p>Thank you for your business!</p>
        `,
        text: `Payment Receipt: Hi ${context.customerName}, thank you for your payment of $${context.amount} to ${context.businessName}.`
      };

      const emailResult = await sendEmail(emailTemplate);
      results.email = emailResult;
    }

    return results;
  } catch (error) {
    console.error('Error in sendPaymentConfirmation:', error);
    return results;
  }
};

// Send subscription expiration alert
export const sendSubscriptionAlert = async (context: NotificationContext): Promise<{ sms: boolean; email: boolean }> => {
  const results = { sms: false, email: false };

  try {
    if (!context.subscriptionName || !context.daysUntilExpiration) return results;

    // Send SMS alert
    if (context.customerPhone) {
      const smsTemplate = createSubscriptionAlert(
        context.businessName,
        context.subscriptionName,
        context.daysUntilExpiration
      );
      smsTemplate.to = context.customerPhone;

      const smsResult = await sendSMS(smsTemplate);
      results.sms = smsResult.success;
    }

    // Send email alert
    if (context.customerEmail) {
      const emailTemplate = {
        to: context.customerEmail,
        subject: `Subscription Expiring Soon - ${context.subscriptionName}`,
        html: `
          <h1>⚠️ Subscription Expiring Soon</h1>
          <p>Hi ${context.customerName},</p>
          <p>Your <strong>${context.subscriptionName}</strong> subscription expires in <strong>${context.daysUntilExpiration} days</strong>.</p>
          <p>Renew now to avoid service interruption:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Renew Subscription</a>
          </div>
          <p>If you have any questions, please contact us.</p>
          <p>Best regards,<br>${context.businessName}</p>
        `,
        text: `Subscription Alert: Your ${context.subscriptionName} subscription expires in ${context.daysUntilExpiration} days. Renew now to avoid service interruption.`
      };

      const emailResult = await sendEmail(emailTemplate);
      results.email = emailResult;
    }

    return results;
  } catch (error) {
    console.error('Error in sendSubscriptionAlert:', error);
    return results;
  }
};

// Batch send notifications (for scheduled jobs)
export const sendBatchNotifications = async (notifications: Array<{ type: 'reminder' | 'confirmation' | 'payment' | 'subscription'; context: NotificationContext }>): Promise<{ sent: number; failed: number }> => {
  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      let result = { sms: false, email: false };

      switch (notification.type) {
        case 'reminder':
          result = await sendAppointmentReminder(notification.context);
          break;
        case 'confirmation':
          result = await sendBookingConfirmation(notification.context);
          break;
        case 'payment':
          result = await sendPaymentConfirmation(notification.context);
          break;
        case 'subscription':
          result = await sendSubscriptionAlert(notification.context);
          break;
      }

      if (result.sms || result.email) {
        sent++;
      } else {
        failed++;
      }

      // Add delay between notifications to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending batch notification:', error);
      failed++;
    }
  }

  return { sent, failed };
};

// Log notification for tracking
const logNotification = async (data: {
  customerId: string;
  type: 'sms' | 'email';
  purpose: string;
  recipient: string;
  content: string;
  status: 'sent' | 'failed';
  appointmentId?: string;
}) => {
  try {
    // This would log to a notifications table if we had one
    console.log('Notification logged:', data);
    
    // For now, we can use the existing sMSConfirmation table for SMS
    if (data.type === 'sms') {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      });
      
      if (customer) {
        await prisma.message.create({
          data: {
            organizationId: customer.organizationId,
            customerId: data.customerId,
            content: data.content,
            channel: 'SMS',
            direction: 'OUTBOUND',
            status: data.status === 'sent' ? 'SENT' : 'FAILED',
            templateCategory: data.purpose,
            isAutomated: true
          }
        });
      }
    }
  } catch (error) {
    console.error('Error logging notification:', error);
  }
};

// Scheduled notification checker (can be called by cron job)
export const processScheduledNotifications = async (): Promise<{ processed: number; errors: number }> => {
  let processed = 0;
  let errors = 0;

  try {
    // Check for appointments needing reminders (24 hours before)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const appointmentsNeedingReminders = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        status: 'CONFIRMED'
      },
      include: {
        customer: true,
        organization: true
      }
    });

    for (const appointment of appointmentsNeedingReminders) {
      try {
        const context: NotificationContext = {
          customerId: appointment.customer?.id || '',
          customerName: appointment.customer?.name || '',
          customerEmail: appointment.customer?.email || undefined,
          customerPhone: appointment.customer?.phone || undefined,
          businessName: appointment.organization?.name || '',
          appointmentId: appointment.id,
          appointmentDate: appointment.startTime.toLocaleString(),
          serviceName: appointment.title || 'Appointment'
        };

        const result = await sendAppointmentReminder(context);

        if (result.sms || result.email) {
          // Note: reminderSent fields don't exist in current schema
          // await prisma.appointment.update({
          //   where: { id: appointment.id },
          //   data: {
          //     reminderSent: true,
          //     reminderSentAt: new Date()
          //   }
          // });
          console.log(`Reminder sent for appointment ${appointment.id}`);
          processed++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error('Error processing appointment reminder:', error);
        errors++;
      }
    }

    // Check for subscriptions needing alerts
    const subscriptionAlertDays = [30, 15, 7, 1]; // Days before expiration
    
    for (const days of subscriptionAlertDays) {
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + days);
      alertDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(alertDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const subscriptionsNeedingAlerts = await prisma.subscription.findMany({
        where: {
          endDate: {
            gte: alertDate,
            lt: nextDay
          },
          status: 'ACTIVE',
          alertDays: {
            has: days
          },
          OR: [
            { lastAlertSent: null },
            { lastAlertSent: { lt: alertDate } }
          ]
        },
        include: {
          customer: true,
          organization: true
        }
      });

      for (const subscription of subscriptionsNeedingAlerts) {
        if (!subscription.customer) continue;

        try {
          const context: NotificationContext = {
            customerId: subscription.customer.id,
            customerName: subscription.customer.name,
            customerEmail: subscription.customer.email || undefined,
            customerPhone: subscription.customer.phone || undefined,
            businessName: subscription.organization.name,
            subscriptionName: subscription.name,
            daysUntilExpiration: days
          };

          const result = await sendSubscriptionAlert(context);

          if (result.sms || result.email) {
            // Mark alert as sent
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                lastAlertSent: new Date()
              }
            });
            processed++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error('Error processing subscription alert:', error);
          errors++;
        }
      }
    }

    console.log(`Processed ${processed} scheduled notifications with ${errors} errors`);
    return { processed, errors };

  } catch (error) {
    console.error('Error in processScheduledNotifications:', error);
    return { processed, errors: errors + 1 };
  }
};

const notificationService = {
  sendAppointmentReminder,
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendSubscriptionAlert,
  sendBatchNotifications,
  processScheduledNotifications
};

export default notificationService;
