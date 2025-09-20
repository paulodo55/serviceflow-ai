# ServiceFlow by Vervid

Enterprise-grade login system for ServiceFlow, seamlessly integrated with Bubble.io for complete CRM automation.

## 🚀 Features

### Authentication System
- **Enterprise-grade security** with NextAuth.js
- **Multi-provider support** (Email/Password, Google, Microsoft)
- **JWT token integration** for seamless Bubble.io connection
- **Rate limiting** and brute force protection
- **Session management** with timeout warnings
- **Password recovery** with secure token validation

### Security Features
- **reCAPTCHA v3** background verification
- **WCAG AA compliant** accessibility
- **Secure password hashing** with bcrypt
- **Session timeout** protection (30 minutes with 5-minute warning)
- **Rate limiting** (5 attempts per 5 minutes)

### UI/UX Excellence
- **VervidFlow branding** with exact color matching
- **Responsive design** (desktop, tablet, mobile)
- **Smooth animations** with Framer Motion
- **Loading states** and error handling
- **Form validation** with real-time feedback

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **NextAuth.js** for authentication
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT tokens

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXTAUTH_SECRET=your-super-secret-jwt-secret-key-here
   NEXTAUTH_URL=https://vervidflow.com
   GOOGLE_CLIENT_ID=your-google-client-id (optional)
   GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
   MICROSOFT_CLIENT_ID=your-microsoft-client-id (optional)
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret (optional)
   RECAPTCHA_SITE_KEY=your-recaptcha-site-key (optional)
   RECAPTCHA_SECRET=your-recaptcha-secret (optional)
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Authentication Flow

### Standard Login
1. User visits `/login`
2. Enters credentials (email/password)
3. System validates and generates JWT
4. User redirected to `https://app.vervidflow.com?token=<JWT>`
5. Bubble app receives and validates JWT

### Social Login (OAuth)
1. User clicks "Continue with Google/Microsoft"
2. OAuth flow completes
3. JWT generated with user info
4. Redirect to Bubble app with token

### Password Recovery
1. User visits `/forgot-password`
2. Enters email address
3. Reset token generated and sent (logged in development)
4. User clicks reset link: `/reset-password?token=<TOKEN>`
5. New password set and account updated

## 🎨 Design System

### Colors (Tailwind Config)
```javascript
colors: {
  primary: "#6366F1",    // Indigo-500
  secondary: "#8B5CF6",  // Violet-500
  accent: "#A78BFA",     // Violet-400
  dark: "#0A0A0A",
  darkGray: "#111111",
  darkCard: "#1A1A1A",
}
```

### Typography
- **Font:** Inter (system fallback)
- **Headings:** Bold, gradient text
- **Body:** Light weight for readability

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Custom login with Bubble integration
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js handlers
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset completion

### Rate Limiting
All authentication endpoints include rate limiting:
- **5 attempts per 5 minutes** per IP address
- **Exponential backoff** on repeated failures
- **Clear error messages** with retry timing

## 🧪 Testing

### Demo Credentials
For development testing:
- **Email:** demo@vervidflow.com
- **Password:** password123

### Test Scenarios
1. **Successful login** → Redirect to Bubble app
2. **Invalid credentials** → Error message display
3. **Rate limiting** → Lockout after 5 attempts
4. **Password reset** → Token generation and validation
5. **Social login** → OAuth flow completion

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables (Production)
```env
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://vervidflow.com
GOOGLE_CLIENT_ID=<production-google-id>
GOOGLE_CLIENT_SECRET=<production-google-secret>
RECAPTCHA_SITE_KEY=<production-recaptcha-key>
RECAPTCHA_SECRET=<production-recaptcha-secret>
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] reCAPTCHA configured and tested
- [ ] OAuth providers configured with correct URLs
- [ ] Rate limiting tested under load
- [ ] Database configured for user storage (replace mock data)
- [ ] Email service configured for password resets

### Security Headers
Vercel automatically includes:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 🎯 Bubble.io Integration

### JWT Payload
```javascript
{
  id: "user-id",
  email: "user@example.com",
  name: "User Name",
  timestamp: 1234567890
}
```

### Bubble Setup
1. Create API endpoint to receive JWT tokens
2. Validate JWT signature using `NEXTAUTH_SECRET`
3. Extract user information and create/update user
4. Redirect to appropriate dashboard page

## 📞 Support

For technical support or questions:
- **Email:** hello@vervidai.com
- **Phone:** (512) 264-5260
- **Documentation:** This README

## 📄 License

Proprietary software owned by Vervid. All rights reserved.

---

**Built with ❤️ by Vervid Team**# Added for cache-clear test
