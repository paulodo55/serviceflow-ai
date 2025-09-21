# iCloud Email Setup for ServiceFlow

## 📧 **iCloud SMTP Configuration**

Since `hello@vervidai.com` is actually an iCloud account, here's the correct setup:

## 🔧 **Environment Variables for Vercel**

Add these to your Vercel project (Settings → Environment Variables):

```bash
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=hello@vervidai.com
SMTP_PASSWORD=your_icloud_app_password
```

## 🔑 **How to Get iCloud App Password**

1. **Go to**: [appleid.apple.com](https://appleid.apple.com)
2. **Sign in** with your iCloud account (`hello@vervidai.com`)
3. **Security Section** → **App-Specific Passwords**
4. **Generate Password** → Select "Mail" 
5. **Label it**: "ServiceFlow Email System"
6. **Copy the generated password** (format: `abcd-efgh-ijkl-mnop`)
7. **Use this as your `SMTP_PASSWORD`**

## 📋 **Complete Vercel Environment Variables**

```bash
# iCloud SMTP Settings
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=hello@vervidai.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop

# Existing Auth Variables (keep these)
NEXTAUTH_SECRET=your_existing_secret
NEXTAUTH_URL=https://vervidflow.com
```

## 🚨 **Important Notes**

### **iCloud SMTP Limitations**
- ⚠️ **2FA Required**: Must have Two-Factor Authentication enabled
- ⚠️ **App Passwords Only**: Cannot use regular iCloud password
- ⚠️ **Rate Limits**: iCloud has stricter sending limits than Gmail
- ⚠️ **Reliability**: iCloud SMTP can be less reliable for automated emails

### **Alternative Recommendations**

If iCloud doesn't work well, consider these options:

#### **Option 1: Gmail (Recommended)**
Create a dedicated Gmail account for ServiceFlow:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=serviceflow.vervid@gmail.com
SMTP_PASSWORD=gmail_app_password
```

#### **Option 2: SendGrid (Professional)**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

## 🧪 **Testing Steps**

1. **Add environment variables** to Vercel
2. **Wait for automatic redeploy** (or trigger manual deploy)
3. **Test signup** at your website
4. **Check email inbox** (including spam folder)
5. **Check Vercel function logs** if emails don't arrive

## 🔍 **Troubleshooting iCloud Issues**

### **Common Problems:**
1. **"Authentication failed"**
   - Ensure 2FA is enabled on iCloud account
   - Use app-specific password, not regular password
   - Check that app password is active

2. **"Connection refused"**
   - Verify SMTP settings: `smtp.mail.me.com:587`
   - Check if iCloud SMTP is blocked in your region
   - Try alternative port 465 with secure: true

3. **"Rate limited"**
   - iCloud limits sending frequency
   - Consider switching to Gmail or SendGrid for higher volume

## 🚀 **Quick Setup**

I've updated the code to support iCloud SMTP. Just add these 4 variables to Vercel:

```
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=hello@vervidai.com
SMTP_PASSWORD=your_icloud_app_password
```

Then test your free trial signup!

---

**If iCloud gives you trouble, I recommend creating a dedicated Gmail account for more reliable email delivery.** 📧
