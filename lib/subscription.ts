import { prisma } from './prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import type { SubscriptionTier } from '@/types'

export const TIER_LIMITS = {
  free: {
    eventTypes: 1,
    bookingsPerMonth: 10,
    teamMembers: 1,
  },
  pro: {
    eventTypes: null, // unlimited
    bookingsPerMonth: null,
    teamMembers: 1,
  },
  business: {
    eventTypes: null,
    bookingsPerMonth: null,
    teamMembers: 5,
  },
}

export const TIER_FEATURES = {
  free: [
    { name: '1 event type', included: true },
    { name: 'Up to 10 bookings/month', included: true },
    { name: 'Basic email notifications', included: true },
    { name: 'Community support', included: true },
    { name: 'Google Calendar integration', included: false },
    { name: 'Custom branding', included: false },
    { name: 'Advanced analytics', included: false },
  ],
  pro: [
    { name: 'Unlimited event types', included: true },
    { name: 'Unlimited bookings', included: true },
    { name: 'Google Calendar integration', included: true },
    { name: 'Custom branding', included: true },
    { name: 'Remove SchedulePro branding', included: true },
    { name: 'Email & SMS reminders', included: true },
    { name: 'Priority support', included: false },
    { name: 'Team scheduling', included: false },
  ],
  business: [
    { name: 'Everything in Pro', included: true },
    { name: 'Team scheduling (5 users)', included: true },
    { name: 'Advanced analytics', included: true },
    { name: 'Priority support', included: true },
    { name: 'Custom domain', included: true },
    { name: 'API access', included: true },
    { name: 'Zapier integration', included: true },
  ],
}

export async function checkUsageLimit(
  userId: string,
  limitType: 'eventTypes' | 'bookingsPerMonth'
): Promise<{ allowed: boolean; current: number; limit: number | null; tier: SubscriptionTier }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const tier = (user.subscriptionTier as SubscriptionTier) || 'free'
  const limits = TIER_LIMITS[tier]
  const limit = limits[limitType]

  // If unlimited (null), always allow
  if (limit === null) {
    return { allowed: true, current: 0, limit: null, tier }
  }

  let current = 0

  if (limitType === 'eventTypes') {
    current = await prisma.eventType.count({
      where: { userId },
    })
  } else if (limitType === 'bookingsPerMonth') {
    const now = new Date()
    current = await prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    })
  }

  return {
    allowed: current < limit,
    current,
    limit,
    tier,
  }
}

export async function hasFeatureAccess(
  userId: string,
  feature: 'calendar_integration' | 'custom_branding' | 'api_access' | 'analytics' | 'team_scheduling'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) return false

  const featureAccess: Record<string, string[]> = {
    free: [],
    pro: ['calendar_integration', 'custom_branding'],
    business: ['calendar_integration', 'custom_branding', 'api_access', 'analytics', 'team_scheduling'],
  }

  const tier = (user.subscriptionTier as SubscriptionTier) || 'free'
  return featureAccess[tier]?.includes(feature) || false
}

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      razorpaySubscriptionId: true,
      razorpayCustomerId: true,
      razorpayPlanId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      trialEndsAt: true,
    },
  })

  return user
}

export async function getUsageMetrics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: {
          eventTypes: true,
        },
      },
    },
  })

  const now = new Date()
  const periodStart = startOfMonth(now)
  const periodEnd = endOfMonth(now)

  // Count bookings this month
  const bookingsCount = await prisma.booking.count({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  })

  const tier = (user?.subscriptionTier as SubscriptionTier) || 'free'
  const limits = TIER_LIMITS[tier]

  return {
    eventTypes: {
      current: user?._count.eventTypes || 0,
      limit: limits.eventTypes,
    },
    bookings: {
      current: bookingsCount,
      limit: limits.bookingsPerMonth,
    },
    tier,
  }
}

export async function canUpgradeSubscription(userId: string, targetTier: SubscriptionTier): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) return false

  const tierHierarchy = { free: 0, pro: 1, business: 2 }
  const currentTier = (user.subscriptionTier as SubscriptionTier) || 'free'
  
  return tierHierarchy[targetTier] > tierHierarchy[currentTier]
}

export async function canDowngradeSubscription(userId: string, targetTier: SubscriptionTier): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) return false

  const tierHierarchy = { free: 0, pro: 1, business: 2 }
  const currentTier = (user.subscriptionTier as SubscriptionTier) || 'free'
  
  return tierHierarchy[targetTier] < tierHierarchy[currentTier]
}
