'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface EventType {
  id: string
  name: string
  duration: number
  location?: string
  meetingLink?: string
  user: {
    name: string
  }
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

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Booking not found')
        } else {
          throw new Error('Failed to fetch booking')
        }
        return
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (err: any) {
      setError(err.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      zoom: '📹 Zoom Meeting',
      google_meet: '📹 Google Meet',
      phone: '📞 Phone Call',
      in_person: '🏢 In Person',
      custom: '🔗 Video Call',
    }
    return labels[location] || location
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600">{error || 'This booking could not be found.'}</p>
        </div>
      </div>
    )
  }

  const isCancelled = booking.status === 'cancelled'
  const isPast = new Date(booking.startTime) < new Date()
  const canModify = !isCancelled && !isPast

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-8 rounded-t-lg text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">Meeting Confirmed</h1>
          {isCancelled && (
            <div className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg inline-block">
              This booking has been cancelled
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-b-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hi {booking.attendeeName},
            </h2>
            <p className="text-gray-600">
              Your meeting with <strong>{booking.eventType.user.name}</strong> is confirmed!
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
            <div>
              <p className="text-lg font-bold text-gray-900">
                📅 {booking.eventType.name}
              </p>
            </div>

            <div>
              <p className="text-gray-700">
                <strong>🕐</strong>{' '}
                {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div>
              <p className="text-gray-700">
                <strong>⏱️</strong> {booking.eventType.duration} minutes
              </p>
            </div>

            <div>
              <p className="text-gray-700">
                <strong>🌍</strong> {booking.timezone}
              </p>
            </div>

            {booking.eventType.location && (
              <div>
                <p className="text-gray-700">
                  <strong>📍 Location:</strong> {getLocationLabel(booking.eventType.location)}
                </p>
              </div>
            )}

            {booking.eventType.meetingLink && (
              <div>
                <p className="text-gray-700">
                  <strong>🔗 Meeting Link:</strong>
                </p>
                <a
                  href={booking.eventType.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all block mt-1"
                >
                  {booking.eventType.meetingLink}
                </a>
              </div>
            )}
          </div>

          {/* Attendee Notes */}
          {booking.attendeeNotes && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="font-bold text-gray-900 mb-2">Your notes:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.attendeeNotes}</p>
            </div>
          )}

          {/* Action Buttons */}
          {canModify && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href={`/booking/${booking.id}/cancel`}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-center"
              >
                Cancel Booking
              </Link>
              <Link
                href={`/booking/${booking.id}/reschedule`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                Reschedule
              </Link>
            </div>
          )}

          <div className="text-center mt-8 text-gray-600">
            <p>Looking forward to meeting you!</p>
            <p className="mt-2">
              <strong>Best regards,</strong>
              <br />
              {booking.eventType.user.name}
            </p>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Booking ID: <span className="font-mono">{booking.id}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
