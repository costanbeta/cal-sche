import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import {
  RAZORPAY_PLANS,
  createRazorpayCustomer,
  createRazorpaySubscription,
} from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req)
    if (!auth) return unauthorizedResponse()

    const body = await req.json()
    const { tier, billingCycle } = body

    if (!tier || !['pro', 'business'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    // Get user details
    const userData = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        razorpayCustomerId: true,
        subscriptionTier: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already on a paid plan
    if (userData.subscriptionTier !== 'free') {
      return NextResponse.json(
        { error: 'Already subscribed', message: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Get or create Razorpay customer
    let customerId = userData.razorpayCustomerId

    if (!customerId) {
      const customer = await createRazorpayCustomer(userData.name, userData.email)
      customerId = customer.id

      // Save customer ID
      await prisma.user.update({
        where: { id: userData.id },
        data: { razorpayCustomerId: customerId },
      })
    }

    // Get plan ID
    const planId = RAZORPAY_PLANS[tier as keyof typeof RAZORPAY_PLANS]?.[billingCycle as 'monthly' | 'yearly']

    if (!planId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 404 })
    }

    // Create subscription
    const totalCount = billingCycle === 'yearly' ? 12 : 1
    const subscription = await createRazorpaySubscription(planId as string, customerId as string, totalCount, {
      email: userData.email,
    })

    // Save subscription info (status will be 'created' initially)
    await prisma.user.update({
      where: { id: userData.id },
      data: {
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: planId,
        subscriptionStatus: 'created',
      },
    })

    // Return subscription details for frontend to handle payment
    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url, // Razorpay hosted checkout page
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Failed to create subscription checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}
