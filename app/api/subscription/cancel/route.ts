import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { cancelRazorpaySubscription } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req)
    if (!auth) return unauthorizedResponse()

    const userData = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        razorpaySubscriptionId: true,
        subscriptionTier: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.subscriptionTier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    if (!userData.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No subscription ID found' },
        { status: 400 }
      )
    }

    // Cancel subscription at end of cycle
    await cancelRazorpaySubscription(userData.razorpaySubscriptionId, true)

    // Update user record
    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        cancelAtPeriodEnd: true,
        subscriptionStatus: 'cancelled',
      },
    })

    // Log cancellation
    await prisma.subscriptionHistory.create({
      data: {
        userId: auth.userId,
        action: 'cancelled',
        fromTier: userData.subscriptionTier,
        toTier: 'free',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    })
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    )
  }
}
