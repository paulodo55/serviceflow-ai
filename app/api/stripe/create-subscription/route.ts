import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, createStripeCustomer, createSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      await prisma.organization.update({
        where: { id: user.organization.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create subscription
    const subscription = await createSubscription(customerId, priceId)

    // Update organization with subscription info
    await prisma.organization.update({
      where: { id: user.organization.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan: priceId.includes('basic') ? 'basic' : 
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
