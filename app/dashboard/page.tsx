'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  name: string
  username: string
  timezone: string
}

interface EventType {
  id: string
  name: string
  slug: string
  duration: number
  color: string
  isActive: boolean
}

interface Booking {
  id: string
  attendeeName: string
  attendeeEmail: string
  startTime: string
  endTime: string
  timezone: string
  status: string
  eventType: EventType
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch current user
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        router.push('/auth/login')
        return
      }
      const userData = await userRes.json()
      setUser(userData.user)

      // Fetch event types
      const eventTypesRes = await fetch('/api/event-types')
      if (eventTypesRes.ok) {
        const eventTypesData = await eventTypesRes.json()
        setEventTypes(eventTypesData.eventTypes)
      }

      // Fetch upcoming bookings
      const bookingsRes = await fetch('/api/bookings?upcoming=true')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setUpcomingBookings(bookingsData.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleDeleteEventType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return

    try {
      const response = await fetch(`/api/event-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEventTypes(eventTypes.filter(et => et.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete event type:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">SchedulePro</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Your booking link: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'}/{user?.username}
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Event Types</h3>
            <p className="text-3xl font-bold text-blue-600">{eventTypes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Upcoming Bookings</h3>
            <p className="text-3xl font-bold text-green-600">{upcomingBookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">This Week</h3>
            <p className="text-3xl font-bold text-purple-600">
              {upcomingBookings.filter(b => {
                const bookingDate = new Date(b.startTime)
                const oneWeekFromNow = new Date()
                oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
                return bookingDate < oneWeekFromNow
              }).length}
            </p>
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Event Types</h3>
              <Link
                href="/dashboard/event-types/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + New Event Type
              </Link>
            </div>
          </div>
          <div className="p-6">
            {eventTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No event types yet. Create your first one!</p>
                <Link
                  href="/dashboard/event-types/new"
                  className="text-blue-600 hover:underline"
                >
                  Create Event Type
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventTypes.map((eventType) => (
                  <div
                    key={eventType.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: eventType.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{eventType.name}</h4>
                        <p className="text-sm text-gray-500">
                          {eventType.duration} minutes • /{user?.username}/{eventType.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/${user?.username}/${eventType.slug}`}
                        target="_blank"
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/event-types/${eventType.id}`}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEventType(eventType.id)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Bookings</h3>
          </div>
          <div className="p-6">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming bookings
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.eventType.name}</h4>
                      <p className="text-sm text-gray-600">
                        with {booking.attendeeName} ({booking.attendeeEmail})
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy @ h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/availability"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📅</div>
            <h3 className="font-bold text-lg mb-2">Set Availability</h3>
            <p className="text-gray-600 text-sm">
              Configure your working hours and time preferences
            </p>
          </Link>
          <Link
            href="/dashboard/bookings"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-bold text-lg mb-2">All Bookings</h3>
            <p className="text-gray-600 text-sm">
              View and manage all your bookings
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
