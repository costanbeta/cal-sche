export interface User {
  id: string
  email: string
  name: string
  username: string
  timezone: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
  subscriptionTier?: SubscriptionTier
  subscriptionStatus?: SubscriptionStatus
  branding?: BrandingSettings
}

export interface BrandingSettings {
  brandLogoUrl?: string
  brandColor?: string
  brandName?: string
  hidePoweredBy?: boolean
  customFooterText?: string
}

export type SubscriptionTier = 'free' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'created' | 'authenticated' | 'halted'

export interface Subscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  razorpaySubscriptionId?: string
  razorpayCustomerId?: string
  razorpayPlanId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  trialEndsAt?: Date
}

export interface PricingPlan {
  id: string
  name: string
  displayName: string
  description?: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  features: PricingFeature[]
  limits: PricingLimits
  razorpayPlanIdMonthly?: string
  razorpayPlanIdYearly?: string
  isActive: boolean
  sortOrder: number
}

export interface PricingFeature {
  name: string
  included: boolean
  description?: string
  limit?: number
}

export interface PricingLimits {
  eventTypes: number | null // null = unlimited
  bookingsPerMonth: number | null
  teamMembers: number | null
  apiCalls?: number | null
}

export interface UsageMetrics {
  bookings: { current: number; limit: number | null }
  eventTypes: { current: number; limit: number | null }
  teamMembers?: { current: number; limit: number | null }
}

export interface SubscriptionHistory {
  id: string
  action: string
  fromTier?: string
  toTier: string
  amount?: number
  currency: string
  paymentMethod?: string
  transactionId?: string
  createdAt: Date
}

export interface EventType {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  isActive: boolean
  location?: string
  meetingLink?: string
  createdAt: Date
  updatedAt: Date
}

export interface Availability {
  id: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  timezone: string
  createdAt: Date
}

export interface Booking {
  id: string
  eventTypeId: string
  userId: string
  attendeeName: string
  attendeeEmail: string
  attendeeNotes?: string
  startTime: Date
  endTime: Date
  timezone: string
  status: 'confirmed' | 'cancelled' | 'completed'
  googleEventId?: string
  cancellationReason?: string
  createdAt: Date
  updatedAt: Date
  eventType?: EventType
}

export interface DateOverride {
  id: string
  userId: string
  date: Date
  isAvailable: boolean
  startTime?: string
  endTime?: string
  createdAt: Date
}

export interface CalendarConnection {
  id: string
  userId: string
  provider: 'google' | 'outlook'
  accessToken: string
  refreshToken: string
  tokenExpiresAt?: Date
  calendarId?: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}
