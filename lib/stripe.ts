import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    price: 29,
    duration: 'month',
    features: [
      'Up to 3 technicians',
      'Unlimited customers',
      'Advanced scheduling',
      'SMS & Email notifications',
      'Basic reporting',
      'Google Calendar sync'
    ]
  },
  pro: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 79,
    duration: 'month',
    features: [
      'Up to 10 technicians',
      'Everything in Basic',
      'Advanced analytics',
      'Custom branding',
      'QuickBooks integration',
      'Priority support',
      'Mobile app access'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: 149,
    duration: 'month',
    features: [
      'Unlimited technicians',
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'Advanced security',
      'Custom training'
    ]
  }
}

export async function createStripeCustomer(email: string, name: string, organizationId: string) {
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
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export async function getCustomerPortalUrl(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

// Webhook helpers
export function constructWebhookEvent(body: string, signature: string) {
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
