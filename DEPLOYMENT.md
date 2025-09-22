# ServiceFlow Authentication - Deployment Guide

## 🚀 Quick Deployment to Vercel

### 1. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

**Required:**
```
NEXTAUTH_SECRET=your-super-secret-jwt-key-32-chars-minimum
NEXTAUTH_URL=https://vervidflow.com
```

**Optional (for OAuth):**
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-oauth-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-oauth-client-secret
```

**Optional (for reCAPTCHA):**
```
RECAPTCHA_SITE_KEY=your-recaptcha-v3-site-key
RECAPTCHA_SECRET=your-recaptcha-v3-secret-key
```

### 2. Generate Secure NEXTAUTH_SECRET

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### 3. OAuth Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://vervidflow.com/api/auth/callback/google`

#### Microsoft OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new application in Azure AD
3. Add redirect URI: `https://vervidflow.com/api/auth/callback/microsoft`
4. Generate client secret

### 4. reCAPTCHA Setup (Recommended)
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create new site with reCAPTCHA v3
3. Add domain: `vervidflow.com`
4. Copy Site Key and Secret Key

## 🔒 Security Checklist

- [ ] Strong NEXTAUTH_SECRET (32+ characters)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] OAuth redirect URIs match exactly
- [ ] reCAPTCHA configured for production domain
- [ ] Rate limiting tested
- [ ] Environment variables secured in Vercel dashboard

## 🧪 Testing the Integration

### Demo Login Credentials
- **Email:** demo@vervidflow.com  
- **Password:** password123

### Test Flow
1. Visit `https://vervidflow.com/login`
2. Enter demo credentials
3. Should redirect to: `https://vervidflow.com/app`
4. Access ServiceFlow dashboard directly

### JWT Payload Structure
```json
{
  "id": "1",
  "email": "demo@vervidflow.com",
  "name": "Demo User",
  "timestamp": 1234567890,
  "iat": 1234567890,
  "exp": 1234571490
}
```

## 🚀 ServiceFlow App Integration

### Direct Dashboard Access

ServiceFlow now uses a custom-built React application instead of external integrations:

1. **Login** redirects directly to `/app`
2. **No external tokens** needed
3. **Seamless user experience** with NextAuth.js
4. **Advanced dashboard** with real-time analytics

### Authentication Flow

```javascript
// Simplified flow - no external redirects
1. User logs in → NextAuth validates credentials
2. Successful login → Redirect to `/app` 
3. Protected route → Access ServiceFlow dashboard
4. Session management → 30-day JWT tokens
```

## 🛠 Troubleshooting

### Common Issues

**1. "Invalid NEXTAUTH_SECRET" Error**
- Ensure secret is at least 32 characters
- Check environment variable is set in Vercel

**2. OAuth Login Fails**
- Verify redirect URIs match exactly
- Check OAuth credentials are correct
- Ensure OAuth APIs are enabled

**3. "NEXTAUTH_URL Mismatch" Error**
- Set `NEXTAUTH_URL=https://vervidflow.com`
- No trailing slash needed

**4. Rate Limiting Too Aggressive**
- Adjust limits in `/api/auth/login/route.ts`
- Consider using Redis for production rate limiting

**5. JWT Token Invalid in Bubble**
- Verify same `NEXTAUTH_SECRET` used for validation
- Check token hasn't expired (1 hour default)

### Debug Mode

Add to your environment variables for debugging:
```
NEXTAUTH_DEBUG=true
```

This will log detailed authentication information to Vercel logs.

## 📊 Monitoring

### Key Metrics to Monitor
- Login success rate
- Failed login attempts
- OAuth provider success rates
- Page load times for login flows
- JWT token validation rates

### Vercel Analytics
Enable Vercel Analytics to track:
- `/login` page performance
- User flow completion rates
- Geographic login patterns

## 🔄 Updates and Maintenance

### Regular Tasks
- [ ] Rotate `NEXTAUTH_SECRET` quarterly
- [ ] Update OAuth credentials annually
- [ ] Review rate limiting effectiveness
- [ ] Monitor security logs for anomalies
- [ ] Test all login flows monthly

### Version Updates
- Keep NextAuth.js updated for security patches
- Test OAuth integrations after provider updates
- Validate JWT compatibility with Bubble changes

---

## 🆘 Support

**Technical Issues:**
- Email: hello@vervidai.com
- Phone: (512) 264-5260

**Emergency Deployment Issues:**
- Check Vercel deployment logs
- Verify all environment variables
- Test with demo credentials first

**Bubble Integration Issues:**
- Validate JWT payload structure
- Check Bubble API endpoint configuration
- Verify CORS settings if needed
