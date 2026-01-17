'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Subscription {
  subscriptionTier: string
  subscriptionStatus: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
}

interface Usage {
  eventTypes: { current: number; limit: number | null }
  bookings: { current: number; limit: number | null }
  tier: string
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/subscription/usage'),
      ])

      if (!subRes.ok) {
        router.push('/auth/login')
        return
      }

      if (subRes.ok) {
        const data = await subRes.json()
        setSubscription(data.subscription)
      }

      if (usageRes.ok) {
        const data = await usageRes.json()
        setUsage(data.usage)
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Subscription cancelled successfully. You will have access until the end of your billing period.')
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      alert('Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const getUsagePercentage = (current: number, limit: number | null) => {
    if (limit === null) return 0
    return Math.min((current / limit) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {subscription?.subscriptionTier} Plan
                </h3>
                <p className="text-gray-600">
                  Status: <span className="capitalize">{subscription?.subscriptionStatus}</span>
                </p>
                {subscription?.currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                    {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {subscription?.subscriptionTier === 'free' ? (
                  <Link
                    href="/pricing"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upgrade Plan
                  </Link>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling || subscription?.cancelAtPeriodEnd}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : subscription?.cancelAtPeriodEnd ? 'Already Cancelled' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>

            {subscription?.cancelAtPeriodEnd && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-900">
                  ⚠️ Your subscription will be cancelled at the end of the current billing period.
                  You will have access to all features until then.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Usage This Month</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Event Types */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Event Types</span>
                <span className="text-sm text-gray-600">
                  {usage?.eventTypes.current} /{' '}
                  {usage?.eventTypes.limit === null ? '∞' : usage?.eventTypes.limit}
                </span>
              </div>
              {usage?.eventTypes.limit && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getUsagePercentage(usage.eventTypes.current, usage.eventTypes.limit) >= 80
                        ? 'bg-red-500'
                        : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.eventTypes.current, usage.eventTypes.limit)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bookings */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Bookings</span>
                <span className="text-sm text-gray-600">
                  {usage?.bookings.current} /{' '}
                  {usage?.bookings.limit === null ? '∞' : usage?.bookings.limit}
                </span>
              </div>
              {usage?.bookings.limit && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getUsagePercentage(usage.bookings.current, usage.bookings.limit) >= 80
                        ? 'bg-red-500'
                        : 'bg-green-600'
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.bookings.current, usage.bookings.limit)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {usage?.bookings.limit &&
              getUsagePercentage(usage.bookings.current, usage.bookings.limit) >= 80 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-900 text-sm">
                    ⚠️ You&apos;re approaching your monthly booking limit. Upgrade to Pro for
                    unlimited bookings!
                  </p>
                  <Link
                    href="/pricing"
                    className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-block"
                  >
                    View Plans →
                  </Link>
                </div>
              )}
          </div>
        </div>

        {/* Plan Comparison */}
        {subscription?.subscriptionTier === 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-blue-900 mb-3">
              Want more features?
            </h3>
            <p className="text-blue-800 mb-4">
              Upgrade to Pro or Business to unlock unlimited bookings, Google Calendar integration,
              custom branding, and more.
            </p>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
            >
              View All Plans
            </Link>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              All payments are securely processed through Razorpay.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
