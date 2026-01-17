import Razorpay from 'razorpay'
import crypto from 'crypto'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay credentials not configured. Payment features will be disabled.')
}

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null

export const RAZORPAY_PLANS = {
  pro: {
    monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY || '',
    yearly: process.env.RAZORPAY_PLAN_PRO_YEARLY || '',
  },
  business: {
    monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || '',
    yearly: process.env.RAZORPAY_PLAN_BUSINESS_YEARLY || '',
  },
}

// Helper to verify Razorpay webhook signature
export function verifyWebhookSignature(
  webhookBody: string,
  webhookSignature: string,
  webhookSecret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex')
    
    return expectedSignature === webhookSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Helper to create a subscription
export async function createRazorpaySubscription(
  planId: string,
  customerId: string,
  totalCount: number = 12, // 12 months for yearly, 1 for monthly
  notifyInfo: {
    email: string
    phone?: string
  }
): Promise<any> {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: totalCount,
      addons: [],
      notes: {
        created_via: 'SchedulePro',
        customer_email: notifyInfo.email,
      },
    })

    return subscription
  } catch (error) {
    console.error('Failed to create Razorpay subscription:', error)
    throw error
  }
}

// Helper to create a customer
export async function createRazorpayCustomer(
  name: string,
  email: string,
  phone?: string
): Promise<any> {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact: phone || '',
      fail_existing: 0,
      notes: {
        created_via: 'SchedulePro',
      },
    })

    return customer
  } catch (error) {
    console.error('Failed to create Razorpay customer:', error)
    throw error
  }
}

// Helper to cancel subscription
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true
) {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd
    )
    return subscription
  } catch (error) {
    console.error('Failed to cancel Razorpay subscription:', error)
    throw error
  }
}

// Helper to fetch subscription details
export async function fetchRazorpaySubscription(subscriptionId: string) {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Failed to fetch Razorpay subscription:', error)
    throw error
  }
}

// Helper to pause subscription
export async function pauseRazorpaySubscription(subscriptionId: string) {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.pause(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Failed to pause Razorpay subscription:', error)
    throw error
  }
}

// Helper to resume subscription
export async function resumeRazorpaySubscription(subscriptionId: string) {
  if (!razorpay) {
    throw new Error('Razorpay not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.resume(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Failed to resume Razorpay subscription:', error)
    throw error
  }
}

// Get plan tier from Razorpay plan ID
export function getPlanTierFromPlanId(planId: string): 'free' | 'pro' | 'business' {
  const planIdLower = planId.toLowerCase()
  
  if (planIdLower.includes('business')) return 'business'
  if (planIdLower.includes('pro')) return 'pro'
  
  // Check against configured plan IDs
  if (
    planId === RAZORPAY_PLANS.business.monthly ||
    planId === RAZORPAY_PLANS.business.yearly
  ) {
    return 'business'
  }
  
  if (
    planId === RAZORPAY_PLANS.pro.monthly ||
    planId === RAZORPAY_PLANS.pro.yearly
  ) {
    return 'pro'
  }
  
  return 'free'
}
