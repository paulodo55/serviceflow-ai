import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Skip during build phase to prevent Stripe initialization
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ received: true })
    }
    
    // Dynamically import to prevent build-time initialization
    const { stripeService } = await import('@/lib/google-integration')
    
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Handle webhook using the integrated service
    await stripeService.handleWebhook(signature, body)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}