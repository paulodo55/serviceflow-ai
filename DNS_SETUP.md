# DNS Configuration Guide for VervidFlow

## Cloudflare DNS Records Setup

### 1. Vercel Domain Verification
Add these records in your Cloudflare DNS settings:

```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: ✅ Proxied (Orange Cloud)

Type: A
Name: @
Content: 76.76.19.61
Proxy: ✅ Proxied (Orange Cloud)

Type: A
Name: @
Content: 76.76.21.21
Proxy: ✅ Proxied (Orange Cloud)
```

### 2. Twilio Domain Verification
Add this TXT record for Twilio:

```
Type: TXT
Name: _twilio
Content: [TOKEN_FROM_TWILIO_CONSOLE]
Proxy: ⚫ DNS Only (Gray Cloud)
TTL: Auto
```

### 3. Email Verification (SendGrid/DKIM)
If using SendGrid, add these records:

```
Type: CNAME
Name: s1._domainkey
Content: s1.domainkey.u[USERID].wl[SUBUSER].sendgrid.net
Proxy: ⚫ DNS Only

Type: CNAME
Name: s2._domainkey
Content: s2.domainkey.u[USERID].wl[SUBUSER].sendgrid.net
Proxy: ⚫ DNS Only

Type: TXT
Name: @
Content: v=spf1 include:sendgrid.net ~all
Proxy: ⚫ DNS Only
```

### 4. Additional Security Records
Recommended security DNS records:

```
Type: TXT
Name: @
Content: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
Proxy: ⚫ DNS Only

Type: CAA
Name: @
Content: 0 issue "letsencrypt.org"
Proxy: ⚫ DNS Only

Type: CAA
Name: @
Content: 0 issue "digicert.com"
Proxy: ⚫ DNS Only
```

## Verification Commands

### Check Vercel Domain
```bash
dig yourdomain.com
nslookup yourdomain.com
```

### Check Twilio TXT Record
```bash
dig TXT _twilio.yourdomain.com
nslookup -type=TXT _twilio.yourdomain.com
```

### Check Email Records
```bash
dig TXT yourdomain.com
dig CNAME s1._domainkey.yourdomain.com
```

## Cloudflare Settings

### SSL/TLS Configuration
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"

### Security Settings
1. Go to Security → WAF
2. Enable "Security Level: Medium"
3. Enable "Bot Fight Mode"

### Speed Optimization
1. Go to Speed → Optimization
2. Enable "Auto Minify" for HTML, CSS, JS
3. Enable "Brotli"
4. Set "Browser Cache TTL" to 1 month

### Page Rules (if needed)
```
URL: www.yourdomain.com/*
Settings: Forwarding URL (301 - Permanent Redirect)
Destination: https://yourdomain.com/$1
```

## Environment Variables Update

Update your .env.local file:
```env
NEXTAUTH_URL="https://yourdomain.com"
TWILIO_VERIFIED_DOMAIN="yourdomain.com"
TWILIO_WEBHOOK_BASE_URL="https://yourdomain.com"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```
