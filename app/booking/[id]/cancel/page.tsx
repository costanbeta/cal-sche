'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface EventType {
  id: string
  name: string
  duration: number
  user: {
    name: string
  }
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

export default function CancelBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchBooking = useCallback(async () => {
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
      
      if (data.booking.status === 'cancelled') {
        setError('This booking has already been cancelled')
        setBooking(data.booking)
      } else if (new Date(data.booking.startTime) < new Date()) {
        setError('This booking is in the past and cannot be cancelled')
        setBooking(data.booking)
      } else {
        setBooking(data.booking)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancelling(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been successfully cancelled. A confirmation email has been sent to {booking?.attendeeEmail}.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
            <p className="text-sm text-gray-700">
              <strong>{booking?.eventType.name}</strong> with {booking?.eventType.user.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            If you&apos;d like to reschedule, please visit the booking page again.
          </p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  if (error && booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cannot Cancel</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
            <p className="text-sm text-gray-700">
              <strong>{booking.eventType.name}</strong> with {booking.eventType.user.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-sm text-gray-600">Status: {booking.status}</p>
          </div>
          <button
            onClick={() => router.push(`/booking/${bookingId}`)}
            className="text-blue-600 hover:underline"
          >
            ← Back to Booking Details
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-8 rounded-t-lg text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-3xl font-bold">Cancel Booking</h1>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-b-lg shadow-lg p-8">
          <p className="text-gray-600 mb-6">
            You&apos;re about to cancel the following booking:
          </p>

          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {booking?.eventType.name}
                </p>
                <p className="text-gray-600">with {booking?.eventType.user.name}</p>
              </div>

              <div>
                <p className="text-gray-700">
                  <strong>Date & Time:</strong>{' '}
                  {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <strong>Duration:</strong> {booking?.eventType.duration} minutes
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <strong>Attendee:</strong> {booking?.attendeeName} ({booking?.attendeeEmail})
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Form */}
          <form onSubmit={handleCancel} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Let us know why you&apos;re cancelling..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/booking/${bookingId}`)}
                disabled={cancelling}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Keep Booking
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Both you and the host will receive a cancellation confirmation email.
          </p>
        </div>
      </div>
    </div>
  )
}
