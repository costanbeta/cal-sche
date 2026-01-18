'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface BrandingSettings {
  brandLogoUrl?: string
  brandColor?: string
  brandName?: string
  hidePoweredBy?: boolean
  customFooterText?: string
}

interface User {
  subscriptionTier: string
  subscriptionStatus: string
  branding: BrandingSettings
}

export default function BrandingSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const [brandColor, setBrandColor] = useState('#2563EB')
  const [brandName, setBrandName] = useState('')
  const [hidePoweredBy, setHidePoweredBy] = useState(false)
  const [customFooterText, setCustomFooterText] = useState('')

  const isPro = user?.subscriptionTier === 'pro'
  const isBusiness = user?.subscriptionTier === 'business'
  const canUseBranding = isPro || isBusiness
  const canHidePoweredBy = isBusiness

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      setUser(data.user) // Changed from data to data.user

      // Load existing branding settings
      if (data.user.branding) {
        setBrandLogoUrl(data.user.branding.brandLogoUrl || '')
        setBrandColor(data.user.branding.brandColor || '#2563EB')
        setBrandName(data.user.branding.brandName || '')
        setHidePoweredBy(data.user.branding.hidePoweredBy || false)
        setCustomFooterText(data.user.branding.customFooterText || '')
      }
    } catch (err) {
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/users/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandLogoUrl: brandLogoUrl.trim() || null,
          brandColor,
          brandName: brandName.trim() || null,
          hidePoweredBy: canHidePoweredBy ? hidePoweredBy : false,
          customFooterText: customFooterText.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save branding settings')
      }

      setMessage('Branding settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" />
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Custom Branding
          </h1>
          <p className="text-gray-600">
            Customize your booking page with your brand colors, logo, and messaging.
          </p>
        </div>

        {/* Subscription Gate */}
        {!canUseBranding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⭐</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Upgrade to Pro or Business
                </h3>
                <p className="text-gray-600 mb-4">
                  Custom branding is available for Pro and Business subscribers.
                  Upgrade to personalize your booking page with your brand.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Branding Settings</h2>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your Company Name"
                  disabled={!canUseBranding}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed on your booking page
                </p>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    disabled={!canUseBranding}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2563EB"
                    disabled={!canUseBranding}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono"
                    pattern="^#[A-Fa-f0-9]{6}$"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used for buttons and accents on your booking page
                </p>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={!canUseBranding}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your logo to a hosting service and paste the URL here
                </p>
              </div>

              {/* Custom Footer Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Footer Text
                </label>
                <textarea
                  value={customFooterText}
                  onChange={(e) => setCustomFooterText(e.target.value)}
                  placeholder="Add a custom message at the bottom of your booking page"
                  disabled={!canUseBranding}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customFooterText.length}/200 characters
                </p>
              </div>

              {/* Hide Powered By (Business only) */}
              <div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hidePoweredBy"
                    checked={hidePoweredBy}
                    onChange={(e) => setHidePoweredBy(e.target.checked)}
                    disabled={!canHidePoweredBy}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor="hidePoweredBy" 
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Hide "Powered by SchedulePro"
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {canHidePoweredBy 
                        ? 'Remove our branding from your booking page' 
                        : '🚀 Business plan only - White-label your booking page'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={!canUseBranding || saving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Preview</h2>
            
            <div className="border-2 border-gray-200 rounded-lg p-6 space-y-6">
              {/* Logo Preview */}
              {brandLogoUrl && canUseBranding ? (
                <div className="flex justify-center">
                  <img 
                    src={brandLogoUrl} 
                    alt="Brand Logo" 
                    className="max-w-[200px] max-h-[60px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    Your Logo
                  </div>
                </div>
              )}

              {/* Brand Name Preview */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {(brandName && canUseBranding) ? brandName : 'Your Brand Name'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">@username</p>
              </div>

              {/* Sample Event Card with Brand Color */}
              <div 
                className="border-2 rounded-lg p-4 cursor-pointer transition"
                style={{
                  borderColor: canUseBranding ? brandColor : '#2563EB'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg"
                    style={{
                      backgroundColor: canUseBranding ? brandColor : '#2563EB'
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold">Sample Meeting</h4>
                    <p className="text-sm text-gray-600">30 min • Video Call</p>
                  </div>
                </div>
              </div>

              {/* Sample Button with Brand Color */}
              <button
                className="w-full py-3 text-white rounded-lg font-semibold transition"
                style={{
                  backgroundColor: canUseBranding ? brandColor : '#2563EB'
                }}
              >
                Book Meeting
              </button>

              {/* Footer Preview */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                {customFooterText && canUseBranding && (
                  <p className="mb-2">{customFooterText}</p>
                )}
                {!(hidePoweredBy && canHidePoweredBy) && (
                  <p className="flex items-center justify-center gap-1">
                    Powered by <Logo size="sm" />
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Changes are applied immediately to your booking page at{' '}
                <span className="font-mono">@{user?.subscriptionTier || 'username'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
