# VervidFlow CRM Production Implementation Guide

## Phase 1: Core Infrastructure (Weeks 1-4)

### Week 1: Database & Authentication

#### 1. Database Schema Updates
Add these models to your `prisma/schema.prisma`:

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  domain    String   @unique
  plan      String   @default("trial") // trial, basic, pro, enterprise
  status    String   @default("active") // active, suspended, cancelled
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
  customers Customer[]
  appointments Appointment[]
  invoices  Invoice[]
  
  // Subscription info
  stripeCustomerId String?
  subscriptionId   String?
  trialEndsAt     DateTime?
  
  @@map("organizations")
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  role           String   @default("user") // admin, manager, technician, user
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("users")
}

model Customer {
  id             String   @id @default(cuid())
  name           String
  email          String?
  phone          String?
  address        String?
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  appointments Appointment[]
  invoices     Invoice[]
  
  @@map("customers")
}

model Appointment {
  id             String   @id @default(cuid())
  title          String
  description    String?
  startTime      DateTime
  endTime        DateTime
  status         String   @default("scheduled") // scheduled, in_progress, completed, cancelled
  customerId     String
  customer       Customer @relation(fields: [customerId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("appointments")
}

model Invoice {
  id             String   @id @default(cuid())
  number         String
  amount         Decimal
  status         String   @default("draft") // draft, sent, paid, overdue
  dueDate        DateTime
  customerId     String
  customer       Customer @relation(fields: [customerId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("invoices")
}
```

#### 2. Environment Variables Setup
Create `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vervidflow_prod"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@your-domain.com"

# File Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="vervidflow-files"
AWS_REGION="us-east-1"
```

#### 3. Authentication System
Install required packages:

```bash
npm install next-auth @next-auth/prisma-adapter stripe @stripe/stripe-js
npm install @sendgrid/mail aws-sdk multer
npm install @types/multer -D
```

### Week 2: Multi-Tenant Architecture

#### 1. Middleware for Organization Context
Create `middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Add organization context to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-organization-id', token.organizationId as string)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/app/:path*', '/api/app/:path*']
}
```

#### 2. Organization Context Hook
Create `lib/useOrganization.ts`:

```typescript
import { useSession } from 'next-auth/react'
import { createContext, useContext } from 'react'

interface OrganizationContextType {
  organizationId: string
  organizationName: string
  plan: string
  isAdmin: boolean
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
```

### Week 3: Stripe Integration

#### 1. Stripe Setup
Create `lib/stripe.ts`:

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  basic: {
    priceId: 'price_basic_monthly',
    price: 29,
    features: ['Up to 3 technicians', 'Basic scheduling', 'Customer management']
  },
  pro: {
    priceId: 'price_pro_monthly', 
    price: 79,
    features: ['Up to 10 technicians', 'Advanced features', 'Integrations']
  },
  enterprise: {
    priceId: 'price_enterprise_monthly',
    price: 149,
    features: ['Unlimited technicians', 'Custom features', 'Priority support']
  }
}
```

#### 2. Subscription API Routes
Create `app/api/stripe/create-subscription/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId } = await request.json()

  try {
    // Create or retrieve Stripe customer
    const organization = await prisma.organization.findFirst({
      where: { users: { some: { email: session.user.email } } }
    })

    let customerId = organization?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: organization?.name,
      })
      customerId = customer.id

      await prisma.organization.update({
        where: { id: organization!.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
```

### Week 4: Email & Notifications

#### 1. Email Service Setup
Create `lib/email.ts`:

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html,
  templateId,
  dynamicTemplateData
}: {
  to: string
  subject?: string
  html?: string
  templateId?: string
  dynamicTemplateData?: any
}) {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL!,
      subject,
      html,
      templateId,
      dynamicTemplateData
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'd-welcome-template-id',
  APPOINTMENT_REMINDER: 'd-appointment-reminder-id',
  INVOICE_SENT: 'd-invoice-sent-id',
  PAYMENT_RECEIVED: 'd-payment-received-id'
}
```

## Phase 2: Core Features (Weeks 5-8)

### Customer Management System
### Advanced Scheduling
### Invoice & Payment Processing
### Mobile-Responsive Design

## Phase 3: Advanced Features (Weeks 9-12)

### Integrations (QuickBooks, Google Calendar)
### Reporting & Analytics
### Mobile App Development
### White-label Customization

## Phase 4: Scale & Polish (Weeks 13-16)

### Performance Optimization
### Security Audits
### Customer Onboarding
### Marketing Site

## Immediate Action Items

1. **Set up production database** (PostgreSQL on Railway, Supabase, or AWS)
2. **Create Stripe account** and set up products/prices
3. **Get SendGrid account** for transactional emails
4. **Set up domain** and SSL certificate
5. **Create staging environment** for testing

## Cost Estimates

### Monthly Operating Costs:
- **Database**: $25-100/month (Railway/Supabase)
- **Email Service**: $15-50/month (SendGrid)
- **File Storage**: $10-30/month (AWS S3)
- **Hosting**: $20-100/month (Vercel Pro/AWS)
- **Monitoring**: $25-50/month (Sentry/DataDog)
- **Total**: ~$95-330/month

### Development Tools:
- **Stripe**: 2.9% + 30¢ per transaction
- **Domain**: $15/year
- **SSL**: Free (Let's Encrypt)

## Revenue Projections

With 3 pricing tiers ($29, $79, $149):
- **10 customers**: $570-1,490/month
- **50 customers**: $2,850-7,450/month  
- **100 customers**: $5,700-14,900/month

Break-even at ~10-15 customers depending on plan mix.
