# Complete Domain Setup Guide: Vercel + Cloudflare + Twilio

## 🚀 Step-by-Step Setup Process

### **Phase 1: Cloudflare DNS Configuration**

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your domain

2. **Add Vercel DNS Records**
   ```
   Type: A
   Name: @
   Content: 76.76.19.61
   Proxy: 🟠 Proxied
   
   Type: A  
   Name: @
   Content: 76.76.21.21
   Proxy: 🟠 Proxied
   
   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: 🟠 Proxied
   ```

3. **Add Twilio Verification Record**
   ```
   Type: TXT
   Name: _twilio
   Content: [GET_THIS_FROM_TWILIO_CONSOLE]
   Proxy: ⚫ DNS Only
   TTL: Auto
   ```

### **Phase 2: Twilio Domain Verification**

1. **Get Verification Token**
   - Login to [console.twilio.com](https://console.twilio.com)
   - Go to **Account** → **Domains**
   - Click **Add Domain**
   - Enter your domain: `yourdomain.com`
   - Select **DNS Verification**
   - Copy the TXT record value

2. **Add to Cloudflare**
   - Use the TXT record from step 1 above
   - Wait 5-10 minutes for DNS propagation

3. **Verify in Twilio**
   - Return to Twilio console
   - Click **Verify Domain**

### **Phase 3: Vercel Project Configuration**

1. **Deploy to Vercel**
   ```bash
   # Login to Vercel
   npx vercel login
   
   # Deploy your project
   npx vercel --prod
   
   # Add your domain
   npx vercel domains add yourdomain.com
   npx vercel domains add www.yourdomain.com
   ```

2. **Configure Domain in Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your VervidFlow project
   - Go to **Settings** → **Domains**
   - Add both `yourdomain.com` and `www.yourdomain.com`
   - Set `yourdomain.com` as primary (redirect www to root)

### **Phase 4: Environment Variables**

Update your `.env.local` file:

```env
# Production URLs
NEXTAUTH_URL="https://yourdomain.com"
TWILIO_WEBHOOK_BASE_URL="https://yourdomain.com"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_VERIFIED_DOMAIN="yourdomain.com"

# Add these for webhook security
TWILIO_WEBHOOK_SECRET="your-webhook-secret"
CRON_SECRET="your-cron-secret-for-alerts"
```

### **Phase 5: Cloudflare Optimization**

1. **SSL/TLS Settings**
   - Go to **SSL/TLS** → **Overview**
   - Set to **Full (strict)**
   - Enable **Always Use HTTPS**

2. **Security Settings**
   - Go to **Security** → **WAF**
   - Set **Security Level**: Medium
   - Enable **Bot Fight Mode**

3. **Speed Optimization**
   - Go to **Speed** → **Optimization**
   - Enable **Auto Minify** (HTML, CSS, JS)
   - Enable **Brotli**
   - Set **Browser Cache TTL**: 1 month

4. **Page Rules** (Optional)
   ```
   Rule: www.yourdomain.com/*
   Setting: Forwarding URL (301)
   Destination: https://yourdomain.com/$1
   ```

## 🔧 Webhook Configuration

### **Twilio Webhooks**
Configure these webhook URLs in your Twilio console:

```
SMS Webhook: https://yourdomain.com/api/twilio/sms
Voice Webhook: https://yourdomain.com/api/twilio/voice
Status Callback: https://yourdomain.com/api/twilio/status
```

### **Stripe Webhooks** (if using)
```
Webhook URL: https://yourdomain.com/api/stripe/webhook
Events: payment_intent.succeeded, invoice.payment_succeeded, customer.subscription.updated
```

## 🧪 Testing & Verification

### **1. Run DNS Verification Script**
```bash
./scripts/verify-dns.sh yourdomain.com
```

### **2. Test Individual Components**

**Test Domain Resolution:**
```bash
dig yourdomain.com
nslookup yourdomain.com
```

**Test Twilio Verification:**
```bash
dig TXT _twilio.yourdomain.com
```

**Test HTTPS:**
```bash
curl -I https://yourdomain.com
```

**Test Webhooks:**
```bash
# Test Twilio webhook
curl -X POST https://yourdomain.com/api/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B1234567890&To=%2B0987654321&Body=Test"
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **DNS Propagation Delays**
   - Wait up to 24 hours for full propagation
   - Use [whatsmydns.net](https://whatsmydns.net) to check global propagation

2. **Vercel Domain Not Working**
   - Ensure A records point to Vercel IPs
   - Check Vercel dashboard for domain status

3. **Twilio Verification Failing**
   - Verify TXT record is exactly as provided
   - Ensure DNS Only (gray cloud) in Cloudflare
   - Check for typos in record name/value

4. **SSL Certificate Issues**
   - Set Cloudflare SSL to "Full (strict)"
   - Wait for certificate provisioning (up to 24 hours)

5. **Webhook Failures**
   - Check webhook URLs are accessible
   - Verify webhook secrets match
   - Check server logs for errors

## 📱 Mobile App Configuration (if applicable)

If you're building a mobile app, add these records:

```
Type: TXT
Name: apple-app-site-association
Content: {"applinks":{"apps":[],"details":[{"appID":"TEAM_ID.BUNDLE_ID","paths":["*"]}]}}

Type: TXT  
Name: .well-known/assetlinks.json
Content: [{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.yourdomain.app","sha256_cert_fingerprints":["SHA256_FINGERPRINT"]}}]
```

## ✅ Final Checklist

- [ ] Cloudflare DNS records configured
- [ ] Twilio domain verified
- [ ] Vercel deployment successful
- [ ] Domain added to Vercel project
- [ ] SSL certificate active
- [ ] Environment variables updated
- [ ] Webhooks configured and tested
- [ ] DNS verification script passes
- [ ] Application accessible at https://yourdomain.com

## 🔗 Useful Links

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Twilio Domain Verification](https://www.twilio.com/docs/iam/organizations/domains)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [DNS Propagation Checker](https://whatsmydns.net)
- [SSL Test](https://www.ssllabs.com/ssltest/)
