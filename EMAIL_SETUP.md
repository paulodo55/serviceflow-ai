# Email Setup Guide for ServiceFlow

## 🚨 **Current Issue**
The email system was in development/mock mode and only logged emails to the console instead of sending them. This has been **FIXED** with real email functionality.

## ✅ **Solution Implemented**
Updated the email service to use **Nodemailer** with Gmail SMTP for actual email delivery.

## 🔧 **Required Setup**

### **Step 1: Configure Environment Variables in Vercel**

You need to add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```bash
SMTP_USER=hello@vervidai.com
SMTP_PASSWORD=your_app_password_here
```

### **Step 2: Gmail App Password Setup**

Since you're using `hello@vervidai.com`, you need to:

1. **Enable 2-Factor Authentication** on the Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a password
   - Use this generated password as `SMTP_PASSWORD`

### **Step 3: Alternative SMTP Providers**

If Gmail doesn't work, you can use:

#### **SendGrid (Recommended for production)**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

#### **AWS SES**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_access_key
SMTP_PASSWORD=your_aws_secret_key
```

## 🧪 **Testing the Email System**

### **Method 1: Check Vercel Function Logs**
1. Go to Vercel dashboard → Functions tab
2. Look for trial-signup function logs
3. You'll see email sending status

### **Method 2: Manual Test**
Try signing up again with your email. The system will now:
- ✅ Attempt to send real emails
- ✅ Log success/failure in Vercel logs
- ✅ Show detailed error messages if SMTP fails

## 📋 **What Happens Now**

### **If SMTP is Configured:**
- ✅ Real emails will be sent to users
- ✅ Professional HTML templates
- ✅ Temporary passwords delivered instantly

### **If SMTP is NOT Configured:**
- ⚠️ Emails won't be sent
- ⚠️ Console will show warning message
- ⚠️ Email content will be logged for manual sending

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"SMTP credentials not configured"**
   - Add `SMTP_USER` and `SMTP_PASSWORD` to Vercel environment variables

2. **"Invalid login" or "Authentication failed"**
   - Use App Password instead of regular Gmail password
   - Ensure 2FA is enabled on Gmail account

3. **"Connection timeout"**
   - Check if Gmail SMTP is blocked in your region
   - Try alternative SMTP providers

### **Debug Steps:**
1. Check Vercel function logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with a different email provider if Gmail fails

## 🚀 **Quick Setup Commands**

I've already updated the code. You just need to:

1. **Set environment variables in Vercel**:
   ```
   SMTP_USER=hello@vervidai.com
   SMTP_PASSWORD=your_gmail_app_password
   ```

2. **Redeploy** (automatically happens when you push to GitHub)

3. **Test signup** with your email address

## 📧 **Email Templates**

The system sends professional HTML emails with:
- ✅ ServiceFlow branding
- ✅ Temporary login credentials
- ✅ 14-day trial information
- ✅ Support contact details
- ✅ Mobile-responsive design

## 🔐 **Security Features**
- ✅ TLS encryption for email transmission
- ✅ App passwords instead of main account passwords
- ✅ Error handling and fallback logging
- ✅ Environment variable protection

---

**Once you set the SMTP environment variables in Vercel, the email system will work perfectly!** 🎉
