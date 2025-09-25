import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = constructWebhookEvent(body, signature)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: subscription.customer as string }
  })

  if (!organization) return

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      status: subscription.status === 'active' ? 'active' : 'suspended'
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: subscription.customer as string }
  })

  if (!organization) return

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      subscriptionId: null,
      subscriptionStatus: 'canceled',
      status: 'suspended',
      plan: 'trial'
    }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment - could send confirmation email, etc.
  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment - could send notification email, etc.
  console.log(`Payment failed for invoice: ${invoice.id}`)
}
