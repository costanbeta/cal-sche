'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface EventType {
  id: string
  name: string
  duration: number
}

interface Booking {
  id: string
  attendeeName: string
  attendeeEmail: string
  attendeeNotes?: string
  startTime: string
  endTime: string
  timezone: string
  status: string
  eventType: EventType
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/bookings?'
      if (filter === 'upcoming') {
        url += 'upcoming=true&status=confirmed'
      } else if (filter === 'cancelled') {
        url += 'status=cancelled'
      } else {
        url += 'status=confirmed'
      }

      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      
      let filteredBookings = data.bookings
      if (filter === 'past') {
        filteredBookings = filteredBookings.filter(
          (b: Booking) => new Date(b.startTime) < new Date()
        )
      }
      
      setBookings(filteredBookings)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Reason for cancellation (optional):')
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking')
    }
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">View and manage your scheduled meetings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  filter === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  filter === 'past'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  filter === 'cancelled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled
              </button>
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {filter} bookings found
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-6 border rounded-lg ${
                      booking.status === 'cancelled'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 hover:border-blue-500'
                    } transition`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.eventType.name}
                          </h3>
                          {booking.status === 'cancelled' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                              Cancelled
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <strong>Attendee:</strong> {booking.attendeeName} ({booking.attendeeEmail})
                          </p>
                          <p>
                            <strong>When:</strong>{' '}
                            {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy @ h:mm a')}
                          </p>
                          <p>
                            <strong>Duration:</strong> {booking.eventType.duration} minutes
                          </p>
                          <p>
                            <strong>Timezone:</strong> {booking.timezone}
                          </p>
                          {booking.attendeeNotes && (
                            <p>
                              <strong>Notes:</strong> {booking.attendeeNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {booking.status === 'confirmed' && new Date(booking.startTime) > new Date() && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
