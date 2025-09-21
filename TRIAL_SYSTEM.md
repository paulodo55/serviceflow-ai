# ServiceFlow Free Trial & Authentication System

## Overview

A comprehensive login and free trial system for vervidflow.com that integrates with a Bubble.io demo application. This system includes enterprise-grade security, email automation, and seamless SSO integration.

## Features

### 🎯 Free Trial Signup System
- **Modern UI**: Clean, responsive design matching vervidflow.com branding
- **Form Validation**: Real-time validation with user-friendly error messages
- **Email Integration**: Automated welcome emails with temporary credentials
- **Security**: Rate limiting, input sanitization, and CSRF protection

### 🔐 Enhanced Authentication
- **Multi-Provider Login**: Email/password, Google OAuth, Microsoft OAuth
- **Bubble.io Integration**: Seamless redirect with JWT tokens
- **Session Management**: Secure sessions with timeout warnings
- **Rate Limiting**: Protection against brute force attacks

### 🚀 API Endpoints

#### Trial Signup
```
POST /api/trial-signup
{
  "fullName": "John Doe",
  "email": "john@company.com",
  "companyName": "Acme Corp",
  "phoneNumber": "+1234567890"
}
```

#### Login
```
POST /api/auth/login
{
  "email": "john@company.com",
  "password": "temporary_password"
}
```

#### Bubble Token Generation
```
GET /api/bubble-token
Headers: Authorization: Bearer {jwt_token}
```

### 📧 Email System
- **Welcome Emails**: Professional HTML templates with login credentials
- **Password Reset**: Secure token-based password recovery
- **Trial Notifications**: Automated reminders and updates

### 🔒 Security Features
- **Rate Limiting**: Configurable limits per endpoint
- **Input Sanitization**: XSS and injection protection
- **CSRF Protection**: Token-based request validation
- **Security Headers**: Complete set of security headers
- **Password Strength**: Enforced strong password requirements

## File Structure

```
/app
├── free-trial/
│   └── page.tsx              # Free trial signup page
├── login/
│   └── page.tsx              # Enhanced login page
└── api/
    ├── trial-signup/
    │   └── route.ts           # Trial signup API
    ├── bubble-token/
    │   └── route.ts           # Bubble.io integration API
    └── auth/
        └── login/
            └── route.ts       # Custom login API

/lib
├── trial-users.ts             # Trial user management
├── email-service.ts           # Email templates and sending
└── security.ts               # Security utilities
```

## User Flow

### 1. Free Trial Registration
1. User visits `/free-trial`
2. Fills out registration form
3. System validates input and checks for existing accounts
4. Creates trial account with 14-day expiration
5. Sends welcome email with temporary credentials
6. Redirects to success page

### 2. Login & Bubble Integration
1. User visits `/login`
2. Enters credentials (trial or regular account)
3. System validates and generates JWT token
4. Redirects to Bubble.io app: `https://odopaul55-61471.bubbleapps.io?token={jwt}&user={email}`
5. Bubble.io app validates token and creates session

### 3. Demo Access
- Direct access button on login page
- Opens Bubble.io demo in new tab
- No authentication required for demo

## Configuration

### Environment Variables
```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://vervidflow.com
BUBBLE_API_KEY=your-bubble-api-key
BUBBLE_API_URL=https://odopaul55-61471.bubbleapps.io/api/1.1
SMTP_PASSWORD=your-smtp-password
RECAPTCHA_SECRET=your-recaptcha-secret
```

### Rate Limits
- **Login**: 5 attempts per 15 minutes
- **Signup**: 3 attempts per hour  
- **Password Reset**: 3 attempts per hour
- **General API**: 60 requests per minute

## Security Implementation

### Input Validation
- Email format validation
- Name validation (letters, spaces, hyphens only)
- Company name validation (2-100 characters)
- Phone number validation (international formats)

### Rate Limiting
```typescript
const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDuration: 15 * 60 * 1000 },
  SIGNUP: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDuration: 60 * 60 * 1000 },
  // ...
};
```

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content Security Policy
- Referrer Policy

## Email Templates

### Welcome Email Features
- Professional HTML design
- Login credentials
- Feature highlights
- Trial expiration date
- Support contact information
- Mobile-responsive design

### Password Reset Email
- Secure token-based reset
- 1-hour expiration
- Security warnings
- Clear call-to-action

## Bubble.io Integration

### JWT Token Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "company": "Company Name",
  "type": "trial|regular",
  "trialExpiresAt": "2024-01-01T00:00:00Z",
  "timestamp": 1234567890,
  "exp": 1234567890
}
```

### Redirect URL Format
```
https://odopaul55-61471.bubbleapps.io?token={jwt_token}&user={email}
```

## Testing

### Manual Testing Checklist
- [ ] Free trial signup form validation
- [ ] Email delivery (check logs)
- [ ] Login with trial credentials
- [ ] Bubble.io redirect functionality
- [ ] Rate limiting behavior
- [ ] Security header presence
- [ ] Mobile responsiveness
- [ ] Social login buttons (OAuth)

### Demo Credentials
- **Email**: demo@vervidflow.com
- **Password**: password123

## Deployment Notes

### Vercel Configuration
- Uses standard Next.js deployment
- All dependencies in `dependencies` (not `devDependencies`)
- Security headers applied to all API responses
- Environment variables configured in Vercel dashboard

### Production Considerations
1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Email Service**: Integrate with SendGrid, AWS SES, or similar
3. **Monitoring**: Add logging and error tracking
4. **Backup**: Implement data backup strategy
5. **Scaling**: Consider Redis for rate limiting and session storage

## Support

For technical support or questions about the trial system:
- **Email**: hello@vervidai.com
- **Phone**: (512) 264-5260
- **Documentation**: This file and inline code comments

## License

This system is part of ServiceFlow by Vervid. All rights reserved.
