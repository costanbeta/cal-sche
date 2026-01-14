'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  username: string
  timezone: string
}

interface CalendarConnection {
  id: string
  provider: string
  createdAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [calendarConnection, setCalendarConnection] = useState<CalendarConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch user data
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        router.push('/auth/login')
        return
      }
      const userData = await userRes.json()
      setUser(userData.user)

      // Fetch calendar connection
      // We'll need to create an API endpoint for this
      // For now, we'll check if Google Calendar is connected
      fetchCalendarConnection(userData.user.id)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendarConnection = async (userId: string) => {
    // This would need a new API endpoint to check calendar connection
    // For now, we'll make it work with existing endpoints
    try {
      const response = await fetch('/api/calendar/status')
      if (response.ok) {
        const data = await response.json()
        if (data.connected) {
          setCalendarConnection(data.connection)
        }
      }
    } catch (error) {
      // Calendar not connected or error fetching
      console.log('Calendar not connected')
    }
  }

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/connect')
      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.authUrl
      } else {
        alert(data.error || 'Failed to initiate Google Calendar connection. Please ensure Google OAuth credentials are configured in your environment variables.')
      }
    } catch (error) {
      console.error('Failed to connect calendar:', error)
      alert('Failed to connect Google Calendar. Please check your internet connection and try again.')
    }
  }

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? This will stop automatic calendar syncing.')) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setCalendarConnection(null)
        alert('Google Calendar disconnected successfully')
      } else {
        alert('Failed to disconnect Google Calendar')
      }
    } catch (error) {
      console.error('Failed to disconnect calendar:', error)
      alert('Failed to disconnect Google Calendar')
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900 mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-gray-900 mt-1">@{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <p className="text-gray-900 mt-1">{user?.timezone}</p>
            </div>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Google Calendar Integration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sync your bookings with Google Calendar and prevent double-bookings
            </p>
          </div>
          <div className="p-6">
            {calendarConnection ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Google Calendar Connected</p>
                    <p className="text-sm text-green-700">
                      Connected on {new Date(calendarConnection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Active Features:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Automatic calendar conflict detection
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      New bookings added to your calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Calendar invites sent to attendees
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cancelled bookings removed from calendar
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleDisconnectCalendar}
                  disabled={disconnecting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect Google Calendar'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Connect your Google Calendar to enable automatic syncing and prevent double-bookings
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Benefits of connecting:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Available time slots automatically exclude your Google Calendar busy times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>New bookings are instantly added to your Google Calendar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Attendees receive Google Calendar invites with meeting details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Cancelled bookings are automatically removed from your calendar</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleConnectCalendar}
                  className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Connect Google Calendar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Booking Links */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Booking Link</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${user?.username}`}
                readOnly
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`)
                  alert('Link copied to clipboard!')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this link with others to let them book time with you
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
