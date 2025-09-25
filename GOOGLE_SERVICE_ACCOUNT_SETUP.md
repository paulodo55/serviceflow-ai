# 🔑 Google Service Account Setup - Complete Guide

## 🎯 **What You're Building**
A **server-to-server** Google Calendar integration that:
✅ **Creates appointments** automatically in Google Calendar
✅ **Syncs in real-time** without user intervention
✅ **Works for all customers** without individual OAuth
✅ **Runs reliably** 24/7 without token expiration
✅ **Scales automatically** as your business grows

---

## 📋 **STEP 1: Google Cloud Console Setup (10 minutes)**

### **1.1 Create Google Cloud Project**
1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - **Project name**: `VervidFlow CRM`
   - **Project ID**: `serviceflow-crm-[random]` (auto-generated)
   - Click "Create"

3. **Wait for Project Creation**
   - Takes 30-60 seconds
   - You'll see a notification when ready

### **1.2 Enable Google Calendar API**
1. **Navigate to APIs & Services**
   - In the left sidebar: "APIs & Services" → "Library"

2. **Search for Calendar API**
   - Search box: "Google Calendar API"
   - Click on "Google Calendar API" result

3. **Enable the API**
   - Click blue "Enable" button
   - Wait for confirmation

### **1.3 Create Service Account**
1. **Go to Service Accounts**
   - Left sidebar: "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"

2. **Service Account Details**
   - **Service account name**: `VervidFlow Calendar Service`
   - **Service account ID**: `serviceflow-calendar` (auto-filled)
   - **Description**: `Service account for VervidFlow CRM calendar integration`
   - Click "Create and Continue"

3. **Grant Permissions (Skip)**
   - Click "Continue" (skip role assignment)
   - Click "Done" (skip user access)

### **1.4 Generate Service Account Key**
1. **Find Your Service Account**
   - In the "Service Accounts" list, find your new account
   - Click on the **email address** (looks like `serviceflow-calendar@serviceflow-crm-123456.iam.gserviceaccount.com`)

2. **Create JSON Key**
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select **"JSON"** format
   - Click "Create"

3. **Download & Secure Key File**
   - File downloads automatically (e.g., `serviceflow-crm-abc123-def456.json`)
   - **⚠️ IMPORTANT**: This file is like a password - keep it secure!
   - **Don't commit to Git** or share publicly

---

## 🔧 **STEP 2: Configure Your VervidFlow CRM (5 minutes)**

### **2.1 Add Environment Variable**

1. **Open Your Downloaded JSON File**
   - The file looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "serviceflow-crm-123456",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...",
     "client_email": "serviceflow-calendar@serviceflow-crm-123456.iam.gserviceaccount.com",
     "client_id": "123456789...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/serviceflow-calendar%40serviceflow-crm-123456.iam.gserviceaccount.com"
   }
   ```

2. **Add to Environment Variables**
   
   **For Local Development** (`.env.local`):
   ```env
   # Copy the ENTIRE JSON content as one line
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"serviceflow-crm-123456","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...","client_email":"serviceflow-calendar@serviceflow-crm-123456.iam.gserviceaccount.com","client_id":"123456789...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/serviceflow-calendar%40serviceflow-crm-123456.iam.gserviceaccount.com"}
   ```

   **For Production** (Vercel Dashboard):
   - Go to your Vercel project settings
   - Environment Variables section
   - Add: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: The entire JSON content (one line)

### **2.2 Test the Integration**

1. **Start Your CRM**
   ```bash
   npm run dev
   ```

2. **Test API Endpoint**
   ```bash
   curl -X GET "http://localhost:3000/api/google-calendar/events" \
     -H "Cookie: next-auth.session-token=your-session-token"
   ```

3. **Expected Response**
   ```json
   {
     "success": true,
     "events": [],
     "count": 0
   }
   ```

---

## 🎯 **STEP 3: Create VervidFlow Calendar (Optional)**

### **3.1 Dedicated Business Calendar**
Instead of using your personal calendar, create a dedicated calendar for your business:

1. **API Call to Create Calendar**
   ```javascript
   const calendarService = getCalendarService();
   const calendarId = await calendarService.createVervidFlowCalendar("Your Business Name");
   ```

2. **Share with Business Owner**
   ```javascript
   await calendarService.shareCalendar(calendarId, "owner@yourbusiness.com");
   ```

3. **Use Calendar ID**
   - Save the `calendarId` in your database
   - Use it for all appointment operations
   - Share with customers for viewing

### **3.2 Calendar Permissions**
The service account can:
✅ **Create events** in any calendar it has access to
✅ **Read events** from shared calendars
✅ **Update/delete events** it created
✅ **Share calendars** with business owners
✅ **Set permissions** for team members

---

## 🧪 **STEP 4: Test Complete Integration (10 minutes)**

### **4.1 Create Test Appointment**
```javascript
// Test data
const testAppointment = {
  customerName: "John Smith",
  customerEmail: "john@example.com",
  customerPhone: "(555) 123-4567",
  service: "AC Repair",
  date: "2024-01-20",
  startTime: "10:00",
  endTime: "11:30",
  notes: "Customer reports AC not cooling properly",
  price: 150,
  address: "123 Main St, Springfield, IL"
};

// API call
const response = await fetch('/api/google-calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointment: testAppointment })
});
```

### **4.2 Verify in Google Calendar**
1. **Go to Google Calendar**
   ```
   https://calendar.google.com/
   ```

2. **Check for Event**
   - Look for "AC Repair - John Smith" on January 20th
   - Click to see full details
   - Verify customer info is included

3. **Test Mobile Sync**
   - Check Google Calendar app on your phone
   - Event should appear automatically
   - Push notifications should work

---

## 🔒 **SECURITY BEST PRACTICES**

### **Environment Variables**
✅ **Never commit** `.env.local` to Git
✅ **Use Vercel environment variables** for production
✅ **Rotate keys annually** for security
✅ **Monitor usage** in Google Cloud Console

### **Access Control**
✅ **Service account** has minimal required permissions
✅ **Calendar sharing** is controlled per business
✅ **API endpoints** require authentication
✅ **Rate limiting** prevents abuse

### **Data Protection**
✅ **Customer data** is encrypted in transit
✅ **Calendar events** include only necessary info
✅ **Deletion** removes events from Google Calendar
✅ **Backup** strategy for important appointments

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **5.1 Vercel Environment Setup**
1. **Go to Vercel Dashboard**
   - Your project → Settings → Environment Variables

2. **Add Service Account JSON**
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: Entire JSON file content (one line)
   - Environments: Production, Preview, Development

3. **Deploy**
   ```bash
   git add .
   git commit -m "Add Google Calendar service account integration"
   git push origin main
   ```

### **5.2 Test Production**
1. **Test API Endpoints**
   ```bash
   curl -X GET "https://yourdomain.com/api/google-calendar/events"
   ```

2. **Create Production Calendar**
   - Use your business name
   - Share with your business email
   - Test appointment creation

3. **Monitor Usage**
   - Google Cloud Console → APIs & Services → Quotas
   - Check for any rate limiting issues
   - Monitor costs (should be free for your usage)

---

## 📊 **USAGE LIMITS & COSTS**

### **Google Calendar API Limits**
- **Free quota**: 1,000,000 requests/day
- **Rate limit**: 100 requests/100 seconds/user
- **Your usage**: ~1,000 requests/month (very low)
- **Cost**: **FREE** for your scale

### **What Counts as a Request**
- Creating appointment: 1 request
- Reading appointments: 1 request  
- Updating appointment: 1 request
- Checking conflicts: 1 request
- **Total per appointment**: ~4 requests

### **Scaling Estimates**
- **100 appointments/month**: 400 requests (0.04% of limit)
- **1,000 appointments/month**: 4,000 requests (0.4% of limit)
- **10,000 appointments/month**: 40,000 requests (4% of limit)

**You won't hit limits until you're processing 250,000+ appointments/month!**

---

## 🎯 **TROUBLESHOOTING**

### **Common Issues**

#### **"Service account not found"**
- ✅ Check `GOOGLE_SERVICE_ACCOUNT_JSON` is set correctly
- ✅ Verify JSON format is valid (no extra spaces/newlines)
- ✅ Ensure service account exists in Google Cloud Console

#### **"Calendar not found"**
- ✅ Use `primary` for user's main calendar
- ✅ Or create dedicated calendar with `createVervidFlowCalendar()`
- ✅ Check calendar sharing permissions

#### **"Insufficient permissions"**
- ✅ Verify Google Calendar API is enabled
- ✅ Check service account has calendar access
- ✅ Try creating a test event manually

#### **"Rate limit exceeded"**
- ✅ Implement exponential backoff
- ✅ Cache calendar data when possible
- ✅ Monitor usage in Google Cloud Console

### **Debug Mode**
Enable detailed logging:
```env
NODE_ENV=development
GOOGLE_DEBUG=true
```

---

## 🏆 **SUCCESS CHECKLIST**

### **✅ Setup Complete When:**
- [ ] Google Cloud project created
- [ ] Calendar API enabled
- [ ] Service account created
- [ ] JSON key downloaded and secured
- [ ] Environment variable configured
- [ ] Test appointment created successfully
- [ ] Event appears in Google Calendar
- [ ] Mobile sync working
- [ ] Production deployment successful

### **✅ Business Value Delivered:**
- [ ] **Professional calendar** that customers recognize
- [ ] **Mobile synchronization** across all devices
- [ ] **Real-time updates** without user intervention
- [ ] **Conflict detection** prevents double-booking
- [ ] **Customer notifications** via Google Calendar
- [ ] **Team sharing** for multi-person businesses
- [ ] **Reliable operation** 24/7 without maintenance

---

## 🚀 **NEXT STEPS**

### **Immediate (Today)**
1. ✅ **Complete service account setup** (30 minutes)
2. ✅ **Test appointment creation** (15 minutes)
3. ✅ **Verify mobile sync** (5 minutes)

### **This Week**
1. 🔄 **Create dedicated business calendar**
2. 🔄 **Set up customer notifications**
3. 🔄 **Test conflict detection**
4. 🔄 **Deploy to production**

### **Next Week**
1. 🔄 **Train team on calendar usage**
2. 🔄 **Create customer onboarding**
3. 🔄 **Monitor usage and performance**
4. 🔄 **Gather customer feedback**

---

## 🎯 **BOTTOM LINE**

### **What You Get**
🏆 **Enterprise-grade calendar integration** for professional scheduling
🏆 **Professional appearance** that builds customer trust
🏆 **Mobile-first experience** that customers expect
🏆 **Reliable automation** that works 24/7
🏆 **Scalable solution** that grows with your business

### **Time Investment**
- **Setup**: 30 minutes one-time
- **Testing**: 15 minutes
- **Deployment**: 10 minutes
- **Total**: 55 minutes for enterprise-grade calendar

### **Business Impact**
- **Higher customer satisfaction** from familiar Google Calendar
- **Reduced no-shows** with mobile notifications
- **Professional credibility** that justifies premium pricing
- **Operational efficiency** with automated scheduling

**VervidFlow, a VervIdai software - Your CRM now has professional calendar functionality! 🚀**
