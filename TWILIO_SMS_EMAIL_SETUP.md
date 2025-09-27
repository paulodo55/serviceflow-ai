# Complete SMS & Email Integration Setup Guide

## 🚀 Overview

This guide covers the complete setup of SMS and email functionality using Twilio and SendGrid for your VervidFlow application.

## 📋 Prerequisites

1. **Twilio Account** - [Sign up at twilio.com](https://www.twilio.com)
2. **SendGrid Account** - [Sign up at sendgrid.com](https://sendgrid.com)
3. **Domain verified** in both Cloudflare and Twilio
4. **Vercel deployment** with custom domain

## 🔧 Step 1: Twilio Configuration

### 1.1 Get Twilio Credentials
1. Login to [Twilio Console](https://console.twilio.com)
2. Navigate to **Account** → **API Keys & Tokens**
3. Copy your:
   - Account SID
   - Auth Token
4. Go to **Phone Numbers** → **Manage** → **Active Numbers**
5. Purchase a phone number or copy your existing number

### 1.2 Configure Webhooks in Twilio
Set these webhook URLs in your Twilio phone number configuration:

```
SMS Webhook URL: https://yourdomain.com/api/twilio/sms
Status Callback URL: https://yourdomain.com/api/twilio/status
HTTP Method: POST
```

### 1.3 Verify Domain (Already Done)
✅ You've already added the TXT record to Cloudflare DNS

## 📧 Step 2: SendGrid Configuration

### 2.1 Get SendGrid API Key
1. Login to [SendGrid Dashboard](https://app.sendgrid.com)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Full Access** or **Restricted Access** with Mail Send permissions
5. Copy the API key

### 2.2 Verify Sender Domain
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Add these DNS records to Cloudflare:

```
Type: CNAME
Name: s1._domainkey
Content: s1.domainkey.u[USERID].wl[SUBUSER].sendgrid.net

Type: CNAME
Name: s2._domainkey  
Content: s2.domainkey.u[USERID].wl[SUBUSER].sendgrid.net

Type: TXT
Name: @
Content: v=spf1 include:sendgrid.net ~all
```

## 🔐 Step 3: Environment Variables

Update your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID="your-account-sid-here"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_VERIFIED_DOMAIN="yourdomain.com"
TWILIO_WEBHOOK_BASE_URL="https://yourdomain.com"

# SendGrid Configuration
SENDGRID_API_KEY="SG.your-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="VervidFlow"

# Security & Cron
CRON_SECRET="your-secure-random-string"
TWILIO_AUTO_RESPONSE="true"

# Optional: SMTP Fallback
SMTP_HOST="smtp.mail.me.com"
SMTP_PORT="587"
SMTP_USER="hello@yourdomain.com"
SMTP_PASSWORD="your-app-password"
```

## 🗄️ Step 4: Database Setup

Run the Prisma migration to add SMS tracking:

```bash
npx prisma db push
```

This will create the necessary tables for SMS confirmations and notifications.

## 🌐 Step 5: Vercel Deployment

### 5.1 Add Environment Variables to Vercel
```bash
# Add all environment variables to Vercel
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL
vercel env add CRON_SECRET
```

### 5.2 Deploy Application
```bash
vercel --prod
```

### 5.3 Set up Cron Job
Create a cron job to process scheduled notifications:

**Option A: Vercel Cron (Recommended)**
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Option B: External Cron Service**
Use a service like [cron-job.org](https://cron-job.org) to hit:
```
GET https://yourdomain.com/api/cron/notifications
Authorization: Bearer your-cron-secret
```

## 🧪 Step 6: Testing

### 6.1 Test DNS Records
```bash
# Run the verification script
./scripts/verify-dns.sh yourdomain.com

# Or manually check:
dig TXT _twilio.yourdomain.com
dig CNAME s1._domainkey.yourdomain.com
```

### 6.2 Test SMS Functionality
```bash
# Test SMS sending via API
curl -X POST https://yourdomain.com/api/communications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-token" \
  -d '{
    "action": "send",
    "to": "+1234567890",
    "message": "Test message from VervidFlow!",
    "type": "notification"
  }'
```

### 6.3 Test Email Functionality
```bash
# Test email sending via API
curl -X POST https://yourdomain.com/api/communications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-token" \
  -d '{
    "action": "send",
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test Email from VervidFlow</h1>",
    "text": "Test Email from VervidFlow"
  }'
```

### 6.4 Test Webhooks
Send a test SMS to your Twilio number and check the logs:
```bash
# Check Vercel logs
vercel logs --follow
```

## 🎯 Step 7: Features Available

After setup, you'll have access to:

### SMS Features
- ✅ Send individual SMS messages
- ✅ Send batch SMS campaigns  
- ✅ Receive incoming SMS messages
- ✅ Auto-responses to common keywords
- ✅ Phone number verification
- ✅ Delivery status tracking
- ✅ Opt-out/opt-in management

### Email Features
- ✅ Send individual emails
- ✅ Send batch email campaigns
- ✅ Pre-built email templates
- ✅ SendGrid integration with tracking
- ✅ SMTP fallback
- ✅ HTML and text email support

### Automated Notifications
- ✅ Appointment reminders (24h before)
- ✅ Booking confirmations
- ✅ Payment confirmations  
- ✅ Subscription expiration alerts
- ✅ Scheduled notification processing

### UI Components
- ✅ SMS Panel for sending messages
- ✅ Email Panel with templates
- ✅ Communications dashboard
- ✅ Message history and tracking
- ✅ Template management

## 📱 Step 8: Usage Examples

### Send Appointment Reminder
```javascript
import { sendAppointmentReminder } from '@/lib/notification-service';

await sendAppointmentReminder({
  customerId: 'customer-id',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+1234567890',
  businessName: 'Your Business',
  appointmentDate: '2024-01-15 at 2:00 PM',
  serviceName: 'Consultation'
});
```

### Send Batch Notifications
```javascript
import { sendBatchNotifications } from '@/lib/notification-service';

await sendBatchNotifications([
  {
    type: 'reminder',
    context: {
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      businessName: 'Your Business',
      appointmentDate: '2024-01-15 at 2:00 PM'
    }
  }
]);
```

## 🔍 Step 9: Monitoring & Analytics

### Check Delivery Status
```javascript
import { getSMSStatus } from '@/lib/sms-service';

const status = await getSMSStatus('message-sid');
console.log(status.status); // 'delivered', 'failed', etc.
```

### View Communication History
Navigate to `/app/communications` in your application to view:
- SMS message history
- Email send history  
- Delivery statistics
- Recent activity feed

## 🚨 Step 10: Troubleshooting

### Common Issues

**SMS not sending:**
- Check Twilio credentials in environment variables
- Verify phone number format (+1234567890)
- Check Twilio account balance
- Verify webhook URLs are accessible

**Emails not sending:**
- Verify SendGrid API key
- Check sender domain authentication
- Verify DNS records are properly set
- Check SendGrid account status

**Webhooks not working:**
- Verify webhook URLs return 200 status
- Check Twilio signature validation
- Ensure HTTPS is used (not HTTP)
- Check server logs for errors

### Debug Commands
```bash
# Test webhook endpoint
curl -X GET https://yourdomain.com/api/twilio/sms

# Test cron job manually
curl -X POST https://yourdomain.com/api/cron/notifications \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret"}'

# Check DNS propagation
nslookup -type=TXT _twilio.yourdomain.com
```

## 📞 Support

If you encounter issues:
1. Check the application logs in Vercel dashboard
2. Verify all environment variables are set correctly
3. Test DNS records using the verification script
4. Check Twilio and SendGrid dashboards for errors
5. Review webhook logs for failed deliveries

## 🎉 Congratulations!

Your VervidFlow application now has complete SMS and email integration with:
- Automated notifications
- Two-way SMS communication  
- Professional email templates
- Comprehensive tracking and analytics
- Scalable webhook handling
- Robust error handling and fallbacks

Your customers will now receive timely notifications and you can communicate effectively through multiple channels!
