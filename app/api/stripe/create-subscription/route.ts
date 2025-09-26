import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createStripeCustomer, createSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()

    // Get user's organization
    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email! },
      include: { organization: true }
    })

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let customerId = user.organization.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(
        user.email,
        user.organization.name,
        user.organization.id
      )
      customerId = customer.id

      // Update organization with Stripe customer ID
      await (prisma as any).organization.update({
        where: { id: user.organization.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create subscription
    const subscription = await createSubscription(customerId, priceId)

    // Update organization with subscription info
    await (prisma as any).organization.update({
      where: { id: user.organization.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        plan: priceId.includes('starter') ? 'starter' : 
              priceId.includes('pro') ? 'pro' : 'enterprise'
      }
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
