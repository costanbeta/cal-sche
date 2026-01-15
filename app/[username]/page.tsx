'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface EventType {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  location?: string
}

interface UserProfile {
  name: string
  username: string
  timezone: string
  eventTypes: EventType[]
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* User Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {profile.name}
          </h1>
          <p className="text-gray-600">
            @{profile.username}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Select an event type to book a meeting
          </p>
        </div>

        {/* Event Types Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {profile.eventTypes.map((eventType) => (
            <Link
              key={eventType.id}
              href={`/${username}/${eventType.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start gap-4">
                {/* Color indicator */}
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: eventType.color }}
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {eventType.name}
                  </h3>
                  
                  {eventType.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {eventType.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{eventType.duration} min</span>
                    </div>
                    
                    {eventType.location && (
                      <div className="flex items-center gap-1">
                        <span>
                          {eventType.location === 'zoom' && '📹'}
                          {eventType.location === 'google_meet' && '📹'}
                          {eventType.location === 'phone' && '📞'}
                          {eventType.location === 'in_person' && '🏢'}
                          {eventType.location === 'custom' && '🔗'}
                        </span>
                        <span>
                          {eventType.location === 'zoom' && 'Zoom'}
                          {eventType.location === 'google_meet' && 'Google Meet'}
                          {eventType.location === 'phone' && 'Phone'}
                          {eventType.location === 'in_person' && 'In Person'}
                          {eventType.location === 'custom' && 'Video Call'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-blue-600 flex-shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by {profile.name}&apos;s Scheduling App</p>
        </div>
      </div>
    </div>
  )
}
