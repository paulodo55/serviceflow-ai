import Stripe from 'stripe'

// Lazy-load Stripe client to prevent build-time errors
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  }
  return stripeClient
}

export const PLANS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    duration: '14 days',
    features: [
      'Up to 5 customers',
      'Basic scheduling',
      'Email notifications',
      'Mobile responsive'
    ]
  },
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 199,
    duration: 'month',
    features: [
      'Up to 500 appointments/month',
      'Basic automated reminders',
      'Email & SMS notifications',
      'Standard analytics dashboard',
      '8/5 support'
    ]
  },
  pro: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 499,
    duration: 'month',
    features: [
      'Up to 2,000 appointments/month',
      'Advanced automated reminders',
      'Multi-channel communications',
      'Real-time status updates',
      'Performance analytics',
      '24/7 AI phone support',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: 'Custom',
    duration: '',
    features: [
      'Unlimited appointments',
      'All premium features',
      'ROI reporting & analytics',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'Advanced API access',
      '24/7 priority support'
    ]
  }
}

export async function createStripeCustomer(email: string, name: string, organizationId: string) {
  const stripe = getStripeClient()
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId
    }
  })
  
  return customer
}

export async function createSubscription(customerId: string, priceId: string) {
  const stripe = getStripeClient()
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })

  return subscription
}

export async function createPaymentIntent(amount: number, customerId: string, metadata = {}) {
  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata
  })

  return paymentIntent
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripeClient()
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export async function getCustomerPortalUrl(customerId: string, returnUrl: string) {
  const stripe = getStripeClient()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

// Webhook helpers
export function constructWebhookEvent(body: string, signature: string) {
  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export function isTrialExpired(trialEnd: Date | null): boolean {
  if (!trialEnd) return false
  return new Date() > trialEnd
}

export function getDaysUntilTrialEnd(trialEnd: Date | null): number {
  if (!trialEnd) return 0
  const now = new Date()
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
