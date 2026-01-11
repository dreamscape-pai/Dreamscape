import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null
    const body = await request.json()
    const { productId, successUrl, cancelUrl } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await db.product.findUnique({
      where: { id: productId, active: true },
    })

    if (!product || !product.stripePriceId) {
      return NextResponse.json({ error: 'Product not found or not configured' }, { status: 404 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        productId: product.id,
        userId: userId || 'guest',
      },
      allow_promotion_codes: true,
    })

    // Create pending order
    await db.order.create({
      data: {
        userId: userId || undefined,
        productId: product.id,
        stripeSessionId: checkoutSession.id,
        amount: product.price,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
