export interface SMSTemplate {
  message: string;
}

export interface TemplateData {
  [key: string]: any;
}

// Template helper function
function renderTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export const smsTemplates = {
  // Appointment reminder SMS
  appointmentReminder: (data: {
    customerName: string;
    appointmentTitle: string;
    appointmentDate: string;
    appointmentTime: string;
    technician: string;
    location: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Reminder: Your ${data.appointmentTitle} appointment is scheduled for ${data.appointmentDate} at ${data.appointmentTime} with ${data.technician}. Location: ${data.location}. Reply STOP to opt out.`
  }),

  // Appointment confirmation SMS
  appointmentConfirmation: (data: {
    customerName: string;
    appointmentTitle: string;
    appointmentDate: string;
    appointmentTime: string;
    technician: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Your ${data.appointmentTitle} appointment is confirmed for ${data.appointmentDate} at ${data.appointmentTime} with ${data.technician}. We'll send a reminder 24hrs before. Reply STOP to opt out.`
  }),

  // Technician on the way SMS
  technicianEnRoute: (data: {
    customerName: string;
    technician: string;
    eta: string;
    phone: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! ${data.technician} is on the way to your location. ETA: ${data.eta}. Contact: ${data.phone}. Reply STOP to opt out.`
  }),

  // Service completed SMS
  serviceCompleted: (data: {
    customerName: string;
    serviceType: string;
    technician: string;
    invoiceNumber?: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Your ${data.serviceType} service has been completed by ${data.technician}. ${data.invoiceNumber ? 'Invoice ${data.invoiceNumber} will be sent via email.' : 'Thank you for choosing our services!'} Reply STOP to opt out.`
  }),

  // Payment reminder SMS
  paymentReminder: (data: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Payment reminder: Invoice ${data.invoiceNumber} for $${data.amount} is due ${data.dueDate}. Please submit payment to avoid late fees. Reply STOP to opt out.`
  }),

  // Payment confirmation SMS
  paymentReceived: (data: {
    customerName: string;
    amount: string;
    invoiceNumber: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Payment of $${data.amount} received for invoice ${data.invoiceNumber}. Thank you! Reply STOP to opt out.`
  }),

  // Welcome SMS for new customers
  welcomeCustomer: (data: {
    customerName: string;
    organizationName: string;
  }): SMSTemplate => ({
    message: `Welcome ${data.customerName}! Thank you for choosing ${data.organizationName}. We're committed to providing excellent service. Reply STOP to opt out.`
  }),

  // Appointment reschedule SMS
  appointmentRescheduled: (data: {
    customerName: string;
    appointmentTitle: string;
    newDate: string;
    newTime: string;
    technician: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Your ${data.appointmentTitle} appointment has been rescheduled to ${data.newDate} at ${data.newTime} with ${data.technician}. Reply STOP to opt out.`
  }),

  // Appointment cancelled SMS
  appointmentCancelled: (data: {
    customerName: string;
    appointmentTitle: string;
    appointmentDate: string;
    reason?: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Your ${data.appointmentTitle} appointment on ${data.appointmentDate} has been cancelled${data.reason ? ` due to ${data.reason}` : ''}. We'll contact you to reschedule. Reply STOP to opt out.`
  }),

  // Emergency service SMS
  emergencyService: (data: {
    customerName: string;
    technician: string;
    eta: string;
    phone: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Emergency service dispatched. ${data.technician} will arrive in ${data.eta}. Contact: ${data.phone}. Reply STOP to opt out.`
  }),

  // Follow-up SMS
  followUp: (data: {
    customerName: string;
    serviceType: string;
    daysAgo: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! How was your ${data.serviceType} service ${data.daysAgo} days ago? We value your feedback. Rate us or reply with comments. Reply STOP to opt out.`
  }),

  // Promotional SMS
  promotion: (data: {
    customerName: string;
    offer: string;
    validUntil: string;
    code?: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Special offer: ${data.offer} valid until ${data.validUntil}${data.code ? '. Use code ${data.code}' : ''}. Book now! Reply STOP to opt out.`
  }),

  // Maintenance reminder SMS
  maintenanceReminder: (data: {
    customerName: string;
    serviceType: string;
    lastServiceDate: string;
    recommendedInterval: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Maintenance reminder: Your ${data.serviceType} was last serviced on ${data.lastServiceDate}. We recommend service every ${data.recommendedInterval}. Schedule today! Reply STOP to opt out.`
  }),

  // Quote ready SMS
  quoteReady: (data: {
    customerName: string;
    serviceType: string;
    validFor: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Your quote for ${data.serviceType} is ready. Quote valid for ${data.validFor}. Check your email or call us to review. Reply STOP to opt out.`
  }),

  // Weather alert SMS
  weatherAlert: (data: {
    customerName: string;
    appointmentDate: string;
    weatherCondition: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! Weather alert for your appointment on ${data.appointmentDate}: ${data.weatherCondition} expected. We'll contact you if rescheduling is needed. Reply STOP to opt out.`
  }),

  // Customer satisfaction survey SMS
  satisfactionSurvey: (data: {
    customerName: string;
    technician: string;
    surveyUrl: string;
  }): SMSTemplate => ({
    message: `Hi ${data.customerName}! How did ${data.technician} do? Please rate your service experience: ${data.surveyUrl}. Your feedback helps us improve! Reply STOP to opt out.`
  })
};

// Render template with data
export function renderSMSTemplate(
  templateName: keyof typeof smsTemplates,
  data: TemplateData
): SMSTemplate {
  const template = (smsTemplates as any)[templateName](data);
  
  return {
    message: renderTemplate(template.message, data)
  };
}

// SMS length validation (160 characters for single SMS, 1600 for concatenated)
export function validateSMSLength(message: string): {
  isValid: boolean;
  length: number;
  segments: number;
  recommendation?: string;
} {
  const length = message.length;
  
  if (length <= 160) {
    return {
      isValid: true,
      length,
      segments: 1
    };
  } else if (length <= 1600) {
    const segments = Math.ceil(length / 153); // 153 chars per segment in concatenated SMS
    return {
      isValid: true,
      length,
      segments,
      recommendation: `Message will be sent as ${segments} segments. Consider shortening for cost efficiency.`
    };
  } else {
    return {
      isValid: false,
      length,
      segments: Math.ceil(length / 153),
      recommendation: 'Message too long. Please shorten to under 1600 characters.'
    };
  }
}

// SMS opt-out handling
export function handleOptOut(message: string): boolean {
  const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'QUIT', 'END', 'CANCEL'];
  const normalizedMessage = message.trim().toUpperCase();
  return optOutKeywords.includes(normalizedMessage);
}

// SMS opt-in handling
export function handleOptIn(message: string): boolean {
  const optInKeywords = ['START', 'SUBSCRIBE', 'YES', 'UNSTOP'];
  const normalizedMessage = message.trim().toUpperCase();
  return optInKeywords.includes(normalizedMessage);
}
