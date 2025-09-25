# Environment Variables Setup

Copy these to your `.env.local` file:

```bash
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-32-chars-min"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID="price_basic_monthly"
STRIPE_PRO_PRICE_ID="price_pro_monthly" 
STRIPE_ENTERPRISE_PRICE_ID="price_enterprise_monthly"

# Email Service (SendGrid)
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@your-domain.com"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="serviceflow-files"
AWS_REGION="us-east-1"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

## Quick Setup Steps:

1. **Database**: Sign up for Railway/Supabase and get your PostgreSQL URL
2. **Stripe**: Create account, get API keys, create 3 products with monthly prices
3. **SendGrid**: Create account for transactional emails
4. **NextAuth Secret**: Generate with: `openssl rand -base64 32`

## Next Steps:
1. Run `npx prisma migrate dev --name init` to create database
2. Run `npx prisma generate` to generate Prisma client
3. Start development server: `npm run dev`
4. Visit `/pricing-new` to test subscription flow
