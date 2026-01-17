import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, getPlanTierFromPlanId } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('No signature in webhook')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Webhook secret not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Razorpay webhook event:', event.event)

    const payload = event.payload.subscription?.entity || event.payload.payment?.entity

    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(payload)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(payload, event.payload.payment?.entity)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(payload)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload)
        break

      case 'subscription.pending':
        await handleSubscriptionPending(payload)
        break

      case 'subscription.halted':
        await handleSubscriptionHalted(payload)
        break

      case 'subscription.paused':
        await handleSubscriptionPaused(payload)
        break

      case 'subscription.resumed':
        await handleSubscriptionResumed(payload)
        break

      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionActivated(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  const planId = subscription.plan_id
  const tier = getPlanTierFromPlanId(planId)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      currentPeriodStart: new Date(subscription.current_start * 1000),
      currentPeriodEnd: new Date(subscription.current_end * 1000),
      cancelAtPeriodEnd: false,
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId: user.id,
      action: 'upgraded',
      fromTier: user.subscriptionTier,
      toTier: tier,
      currency: 'INR',
    },
  })
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.subscriptionHistory.create({
    data: {
      userId: user.id,
      action: 'renewed',
      toTier: user.subscriptionTier,
      amount: payment?.amount ? payment.amount / 100 : 0,
      currency: payment?.currency || 'INR',
      transactionId: payment?.id,
      paymentMethod: payment?.method,
    },
  })

  // Update period dates
  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentPeriodStart: new Date(subscription.current_start * 1000),
      currentPeriodEnd: new Date(subscription.current_end * 1000),
      subscriptionStatus: 'active',
    },
  })
}

async function handleSubscriptionCompleted(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'expired',
      subscriptionTier: 'free',
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId: user.id,
      action: 'downgraded',
      fromTier: user.subscriptionTier,
      toTier: 'free',
    },
  })
}

async function handleSubscriptionCancelled(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'cancelled',
      cancelAtPeriodEnd: true,
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId: user.id,
      action: 'cancelled',
      fromTier: user.subscriptionTier,
      toTier: 'free',
    },
  })
}

async function handleSubscriptionHalted(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'halted',
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId: user.id,
      action: 'payment_failed',
      toTier: user.subscriptionTier,
    },
  })
}

async function handleSubscriptionPending(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'created',
    },
  })
}

async function handleSubscriptionPaused(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'halted',
    },
  })
}

async function handleSubscriptionResumed(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
    },
  })
}
