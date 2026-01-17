'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Add Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  // Prices in INR
  const plans = [
    {
      name: 'Free',
      tier: 'free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '1 event type',
        'Up to 10 bookings/month',
        'Basic email notifications',
        'Community support',
        'SchedulePro branding',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      tier: 'pro',
      price: { monthly: 999, yearly: 9999 }, // ₹999/month or ₹9999/year
      description: 'For professionals',
      features: [
        'Unlimited event types',
        'Unlimited bookings',
        'Google Calendar integration',
        'Custom branding',
        'No SchedulePro branding',
        'Email support',
        'SMS reminders',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      tier: 'business',
      price: { monthly: 2499, yearly: 24999 }, // ₹2499/month or ₹24999/year
      description: 'For teams and businesses',
      features: [
        'Everything in Pro',
        'Team scheduling (5 users)',
        'Advanced analytics',
        'Priority support',
        'Custom domain',
        'API access',
        'Zapier integration',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
  ]

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'free') {
      router.push('/auth/signup')
      return
    }

    setLoading(tier)

    try {
      // Create subscription
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create subscription')
        setLoading(null)
        return
      }

      // Load Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: 'SchedulePro',
        description: `${tier.toUpperCase()} Plan - ${billingCycle}`,
        image: '/logo.png',
        handler: function (response: any) {
          // Payment successful
          alert('Subscription activated successfully!')
          router.push('/dashboard/billing')
        },
        prefill: {
          // These will be auto-filled from Razorpay customer
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout form closed')
            setLoading(null)
          },
        },
      }

      if (typeof window.Razorpay !== 'undefined') {
        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      } else {
        alert('Razorpay SDK not loaded. Please refresh the page.')
        setLoading(null)
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <>
      {/* Add Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                SchedulePro
              </Link>
              <div className="flex gap-4">
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that&apos;s right for you. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-blue-600"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-gray-500'}>
              Yearly
              <span className="ml-2 text-sm text-green-600 font-semibold">Save 17%</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`bg-white rounded-2xl shadow-lg p-8 ${
                  plan.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-blue-600 text-white text-sm font-semibold py-1 px-4 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    ₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-gray-500">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={loading === plan.tier}
                  className={`w-full py-3 rounded-lg font-semibold transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {loading === plan.tier ? 'Loading...' : plan.cta}
                </button>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mt-16">
            <p className="text-gray-600 mb-4">We accept</p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="text-2xl">💳</span>
              <span className="text-gray-700">Credit/Debit Cards</span>
              <span className="text-2xl">📱</span>
              <span className="text-gray-700">UPI</span>
              <span className="text-2xl">🏦</span>
              <span className="text-gray-700">Net Banking</span>
              <span className="text-2xl">💰</span>
              <span className="text-gray-700">Wallets</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Powered by Razorpay - India&apos;s most trusted payment gateway
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I switch plans anytime?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time.
                  Changes take effect at the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">
                  Yes! All paid plans come with a 14-day free trial. No credit card required.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit/debit cards, UPI, net banking, and popular wallets via Razorpay.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What happens if I exceed my limits?</h3>
                <p className="text-gray-600">
                  We&apos;ll notify you when you&apos;re approaching your limits. You can upgrade anytime
                  to unlock unlimited bookings and event types.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
