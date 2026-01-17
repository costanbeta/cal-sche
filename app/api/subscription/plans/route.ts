import { NextRequest, NextResponse } from 'next/server'
import { TIER_LIMITS, TIER_FEATURES } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required
    const plans = [
      {
        id: 'free',
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for getting started',
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: 'INR',
        features: TIER_FEATURES.free,
        limits: TIER_LIMITS.free,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'pro',
        name: 'pro',
        displayName: 'Pro',
        description: 'For professionals',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        currency: 'INR',
        features: TIER_FEATURES.pro,
        limits: TIER_LIMITS.pro,
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'business',
        name: 'business',
        displayName: 'Business',
        description: 'For teams and businesses',
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        currency: 'INR',
        features: TIER_FEATURES.business,
        limits: TIER_LIMITS.business,
        isActive: true,
        sortOrder: 3,
      },
    ]

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
