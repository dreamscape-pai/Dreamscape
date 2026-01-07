import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await request.json()
    const { membershipPlanId, successUrl, cancelUrl } = body

    if (!membershipPlanId) {
      return NextResponse.json({ error: 'Membership plan ID is required' }, { status: 400 })
    }

    const plan = await db.membershipPlan.findUnique({
      where: { id: membershipPlanId, active: true },
    })

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: 'Membership plan not found or not configured' }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/memberships/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/memberships`,
      metadata: {
        membershipPlanId: plan.id,
        userId,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating subscription session:', error)
    return NextResponse.json({ error: 'Failed to create subscription session' }, { status: 500 })
  }
}
