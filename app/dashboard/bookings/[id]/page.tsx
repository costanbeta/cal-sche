'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface EventType {
  id: string
  name: string
  duration: number
  location?: string
  meetingLink?: string
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

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch booking')
      }

      const data = await response.json()
      const foundBooking = data.bookings.find((b: Booking) => b.id === bookingId)
      
      if (!foundBooking) {
        setError('Booking not found')
      } else {
        setBooking(foundBooking)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [bookingId, router])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    const reason = prompt('Reason for cancellation (optional):')
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert('Booking cancelled successfully')
        router.push('/dashboard/bookings')
      } else {
        alert('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <Link
            href="/dashboard/bookings"
            className="text-blue-600 hover:underline"
          >
            ← Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/bookings"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Bookings
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            {booking.status === 'cancelled' && (
              <span className="px-3 py-1 bg-red-100 text-red-700 font-medium rounded">
                Cancelled
              </span>
            )}
            {booking.status === 'confirmed' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 font-medium rounded">
                Confirmed
              </span>
            )}
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Event Type */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {booking.eventType.name}
            </h2>
            <p className="text-gray-600">
              {booking.eventType.duration} minutes
            </p>
          </div>

          <hr />

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
            <p className="text-lg text-gray-900">
              {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-gray-700">
              {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Timezone: {booking.timezone}
            </p>
          </div>

          <hr />

          {/* Attendee Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Attendee</h3>
            <p className="text-lg text-gray-900">{booking.attendeeName}</p>
            <p className="text-gray-600">{booking.attendeeEmail}</p>
          </div>

          {booking.attendeeNotes && (
            <>
              <hr />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.attendeeNotes}</p>
              </div>
            </>
          )}

          {booking.eventType.location && (
            <>
              <hr />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                <p className="text-gray-700">
                  {booking.eventType.location === 'zoom' && '📹 Zoom Meeting'}
                  {booking.eventType.location === 'google_meet' && '📹 Google Meet'}
                  {booking.eventType.location === 'phone' && '📞 Phone Call'}
                  {booking.eventType.location === 'in_person' && '🏢 In Person'}
                  {booking.eventType.location === 'custom' && '🔗 Video Call'}
                </p>
                {booking.eventType.meetingLink && (
                  <a
                    href={booking.eventType.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    {booking.eventType.meetingLink}
                  </a>
                )}
              </div>
            </>
          )}

          <hr />

          {/* Booking ID */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Booking ID</h3>
            <p className="text-sm text-gray-600 font-mono">{booking.id}</p>
          </div>

          {/* Actions */}
          {booking.status === 'confirmed' && new Date(booking.startTime) > new Date() && (
            <>
              <hr />
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Cancel Booking
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
