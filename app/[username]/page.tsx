'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import BrandedFooter from '@/components/BrandedFooter'

interface EventType {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  location?: string
}

interface BrandingSettings {
  brandLogoUrl?: string
  brandColor?: string
  brandName?: string
  hidePoweredBy?: boolean
  customFooterText?: string
}

interface UserProfile {
  name: string
  username: string
  timezone: string
  eventTypes: EventType[]
  branding?: BrandingSettings
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${username}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found')
          }
          throw new Error('Failed to load profile')
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The user you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (profile.eventTypes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-4xl mb-4">📅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {profile.name}
          </h1>
          <p className="text-gray-600">
            This user hasn&apos;t created any event types yet.
          </p>
        </div>
      </div>
    )
  }

  const brandColor = profile.branding?.brandColor || '#2563EB'
  const showPoweredBy = !profile.branding?.hidePoweredBy

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <style jsx>{`
        .brand-hover-border:hover {
          border-color: ${brandColor} !important;
        }
        .brand-text-color {
          color: ${brandColor};
        }
        .brand-bg-color {
          background-color: ${brandColor};
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        {/* User Header */}
        <div className="text-center mb-12">
          {/* Custom Brand Logo or Profile Picture */}
          <div className="flex justify-center mb-6">
            {profile.branding?.brandLogoUrl ? (
              <img 
                src={profile.branding.brandLogoUrl} 
                alt={profile.branding.brandName || profile.name}
                className="max-w-[250px] max-h-[80px] object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-700">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            {profile.branding?.brandName || profile.name}
          </h1>
        </div>

        {/* Event Types - Modern Cards */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {profile.eventTypes.map((eventType) => (
            <Link
              key={eventType.id}
              href={`/${username}/${eventType.slug}`}
              className="block bg-[#1a1a1a] rounded-xl hover:bg-[#242424] transition-all duration-200 p-6 border border-gray-800 hover:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {eventType.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{eventType.duration}m</span>
                    </div>
                    
                    {eventType.location && (
                      <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {(eventType.location === 'zoom' || eventType.location === 'google_meet' || eventType.location === 'custom') && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          )}
                          {eventType.location === 'phone' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          )}
                          {eventType.location === 'in_person' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          )}
                        </svg>
                        <span>
                          {eventType.location === 'zoom' && 'Video Call'}
                          {eventType.location === 'google_meet' && 'Google Meet'}
                          {eventType.location === 'phone' && 'Phone'}
                          {eventType.location === 'in_person' && 'In Person'}
                          {eventType.location === 'custom' && 'Video Call'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer with Custom Branding */}
        <BrandedFooter 
          variant="minimal"
          showPoweredBy={showPoweredBy}
          customText={profile.branding?.customFooterText}
          className="mt-12"
        />
      </div>
    </div>
  )
}
