// SMS service for VervidFlow using Twilio
import { Twilio } from 'twilio';

// Initialize Twilio client conditionally
let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
      throw new Error('Twilio credentials not properly configured');
    }
    
    twilioClient = new Twilio(accountSid, authToken);
  }
  return twilioClient;
}

export interface SMSTemplate {
  to: string;
  message: string;
  type?: 'notification' | 'reminder' | 'confirmation' | 'alert' | 'marketing';
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

// SMS Templates for different use cases
export const createAppointmentReminder = (customerName: string, appointmentDate: string, businessName: string): SMSTemplate => {
  return {
    to: '',
    message: `Hi ${customerName}! This is a reminder for your appointment with ${businessName} on ${appointmentDate}. Reply CONFIRM to confirm or RESCHEDULE to change. Thanks!`,
    type: 'reminder'
  };
};

export const createBookingConfirmation = (customerName: string, appointmentDate: string, businessName: string): SMSTemplate => {
  return {
    to: '',
    message: `Hi ${customerName}! Your appointment with ${businessName} is confirmed for ${appointmentDate}. We'll send you a reminder 24 hours before. See you soon!`,
    type: 'confirmation'
  };
};

export const createPaymentConfirmation = (customerName: string, amount: string, businessName: string): SMSTemplate => {
  return {
    to: '',
    message: `Hi ${customerName}! Your payment of $${amount} to ${businessName} has been processed successfully. Thank you for your business!`,
    type: 'confirmation'
  };
};

export const createWelcomeMessage = (customerName: string, businessName: string): SMSTemplate => {
  return {
    to: '',
    message: `Welcome to ${businessName}, ${customerName}! We're excited to serve you. Book appointments, view services, and get updates at your convenience. Reply STOP to opt out.`,
    type: 'notification'
  };
};

export const createPasswordResetSMS = (customerName: string, resetCode: string): SMSTemplate => {
  return {
    to: '',
    message: `Hi ${customerName}! Your VervidFlow password reset code is: ${resetCode}. This code expires in 10 minutes. If you didn't request this, please ignore.`,
    type: 'confirmation'
  };
};

export const createSubscriptionAlert = (businessName: string, subscriptionName: string, daysLeft: number): SMSTemplate => {
  return {
    to: '',
    message: `Alert: Your ${subscriptionName} subscription expires in ${daysLeft} days. Renew now to avoid service interruption. Contact us for assistance.`,
    type: 'alert'
  };
};

// Send SMS function
export const sendSMS = async (template: SMSTemplate): Promise<SMSResponse> => {
  try {
    // Validate required environment variables
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return {
        success: false,
        error: 'Twilio credentials not configured'
      };
    }

    // Try to get Twilio client
    let client;
    try {
      client = getTwilioClient();
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
      return {
        success: false,
        error: 'Twilio client initialization failed'
      };
    }

    // Validate phone number format
    if (!template.to || !template.to.match(/^\+?[1-9]\d{1,14}$/)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    // Log SMS for development/debugging
    console.log('=== SMS SENDING ===');
    console.log(`To: ${template.to}`);
    console.log(`Type: ${template.type || 'notification'}`);
    console.log(`Message: ${template.message}`);
    console.log('=== END SMS LOG ===');

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: template.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: template.to,
      statusCallback: `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/status`,
    });

    console.log('SMS sent successfully:', message.sid);
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };

  } catch (error: any) {
    console.error('SMS sending error:', error);
    
    // Log detailed error information
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}`);
      console.error(`Twilio Error Message: ${error.message}`);
    }

    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
};

// Batch SMS sending
export const sendBatchSMS = async (templates: SMSTemplate[]): Promise<{ sent: number; failed: number; results: SMSResponse[] }> => {
  const results: SMSResponse[] = [];
  let sent = 0;
  let failed = 0;

  for (const template of templates) {
    const result = await sendSMS(template);
    results.push(result);
    
    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // Add delay between messages to avoid rate limiting
    if (templates.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { sent, failed, results };
};

// Verify phone number function
export const verifyPhoneNumber = async (phoneNumber: string): Promise<{ valid: boolean; formatted?: string; error?: string }> => {
  try {
    const client = getTwilioClient();
    const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();
    
    return {
      valid: lookup.valid,
      formatted: lookup.phoneNumber
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message
    };
  }
};

// Get SMS delivery status
export const getSMSStatus = async (messageId: string): Promise<{ status: string; error?: string }> => {
  try {
    const client = getTwilioClient();
    const message = await client.messages(messageId).fetch();
    
    return {
      status: message.status
    };
  } catch (error: any) {
    return {
      status: 'unknown',
      error: error.message
    };
  }
};

// Opt-out management
export const handleOptOut = async (phoneNumber: string, message: string): Promise<boolean> => {
  const optOutKeywords = ['STOP', 'QUIT', 'CANCEL', 'UNSUBSCRIBE', 'END'];
  const messageUpper = message.toUpperCase().trim();
  
  if (optOutKeywords.includes(messageUpper)) {
    // TODO: Add to opt-out database/list
    console.log(`Opt-out request from ${phoneNumber}`);
    
    // Send confirmation SMS
    await sendSMS({
      to: phoneNumber,
      message: "You have been unsubscribed from SMS notifications. Reply START to opt back in.",
      type: 'notification'
    });
    
    return true;
  }
  
  return false;
};

// Opt-in management
export const handleOptIn = async (phoneNumber: string, message: string): Promise<boolean> => {
  const optInKeywords = ['START', 'YES', 'SUBSCRIBE'];
  const messageUpper = message.toUpperCase().trim();
  
  if (optInKeywords.includes(messageUpper)) {
    // TODO: Remove from opt-out database/list
    console.log(`Opt-in request from ${phoneNumber}`);
    
    // Send welcome SMS
    await sendSMS({
      to: phoneNumber,
      message: "Welcome back! You're now subscribed to SMS notifications. Reply STOP to unsubscribe anytime.",
      type: 'notification'
    });
    
    return true;
  }
  
  return false;
};

const smsService = {
  sendSMS,
  sendBatchSMS,
  verifyPhoneNumber,
  getSMSStatus,
  handleOptOut,
  handleOptIn,
  createAppointmentReminder,
  createBookingConfirmation,
  createPaymentConfirmation,
  createWelcomeMessage,
  createPasswordResetSMS,
  createSubscriptionAlert
};

export default smsService;
