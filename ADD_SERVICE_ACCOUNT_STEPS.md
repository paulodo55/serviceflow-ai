# 🔑 Add Google Service Account - Step by Step

## 📋 **STEP 1: Prepare Your JSON File**

1. **Find your downloaded JSON file** (probably in Downloads folder)
   - File name looks like: `serviceflow-crm-abc123-def456.json`

2. **Open the file in a text editor**
   - Use VS Code, TextEdit, or any text editor
   - Copy the ENTIRE content

3. **Convert to single line** 
   - Remove all line breaks and spaces between elements
   - Should look like: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"...",...}`

## 📋 **STEP 2: Add to Environment Variables**

### **For Local Development:**

1. **Open or create `.env.local` file** in your project root:
   ```bash
   # If file doesn't exist, create it
   touch .env.local
   ```

2. **Add this line to `.env.local`:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id","private_key_id":"your-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"}
   ```

   **⚠️ Replace with YOUR actual JSON content!**

3. **Save the file**

## 📋 **STEP 3: Test the Integration**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to your calendar page:**
   ```
   http://localhost:3000/app/calendar
   ```

3. **Test the API endpoint:**
   ```bash
   curl -X GET "http://localhost:3000/api/google-calendar/events"
   ```

4. **Expected response:**
   ```json
   {
     "success": true,
     "events": [],
     "count": 0
   }
   ```

## 📋 **STEP 4: Add to Production (Vercel)**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your ServiceFlow project

2. **Navigate to Environment Variables:**
   - Settings → Environment Variables

3. **Add new environment variable:**
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: Your single-line JSON content
   - **Environments**: Production, Preview, Development

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Google Calendar integration"
   git push origin main
   ```

## ✅ **Verification Steps**

### **Local Development:**
- [ ] `.env.local` file contains `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] `npm run dev` starts without errors
- [ ] Calendar page loads at `/app/calendar`
- [ ] API endpoint returns success response

### **Production:**
- [ ] Vercel environment variable added
- [ ] Deployment successful
- [ ] Production calendar page works
- [ ] No console errors in browser

## 🚨 **Security Checklist**

- [ ] **Never commit** `.env.local` to Git
- [ ] **Never share** the JSON file publicly
- [ ] **Delete** the downloaded JSON file after setup
- [ ] **Use environment variables** only
- [ ] **Rotate keys** annually for security

## 🎯 **Success Indicators**

When setup is complete, you should see:
✅ **No authentication errors** in console
✅ **Google Calendar embed** loads properly
✅ **API endpoints** return success responses
✅ **Calendar integration** ready for appointments

## 🆘 **Troubleshooting**

### **"Service account not found" error:**
- Check `GOOGLE_SERVICE_ACCOUNT_JSON` is properly set
- Verify JSON format is valid (no extra spaces/newlines)
- Ensure environment variable is loaded

### **"Calendar API not enabled" error:**
- Go to Google Cloud Console
- Enable Google Calendar API for your project

### **"Invalid JSON" error:**
- Verify JSON is properly formatted
- Check for missing quotes or commas
- Use online JSON validator if needed

## 🚀 **Next Steps After Setup**

1. **Create test appointment** in your CRM
2. **Verify it appears** in Google Calendar
3. **Test mobile sync** on your phone
4. **Set up customer notifications**
5. **Deploy to production**

ServiceFlow, a VervIdai software - Your Google Calendar integration is ready for professional scheduling! 🎉
