'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays, startOfDay, parseISO } from 'date-fns'

interface EventType {
  id: string
  name: string
  description?: string
  duration: number
  color: string
  location?: string
  meetingLink?: string
  user: {
    name: string
    username: string
    timezone: string
  }
}

interface Booking {
  id: string
  attendeeName: string
  attendeeEmail: string
  attendeeNotes?: string
  startTime: string
  timezone: string
  status: string
  eventType: EventType
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export default function RescheduleBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      
      if (data.booking.status === 'cancelled') {
        setError('This booking has been cancelled and cannot be rescheduled')
        setBooking(data.booking)
      } else if (new Date(data.booking.startTime) < new Date()) {
        setError('This booking is in the past and cannot be rescheduled')
        setBooking(data.booking)
      } else {
        setBooking(data.booking)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = useCallback(async () => {
    if (!booking) return
    
    setLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability/slots?date=${dateStr}&eventTypeId=${booking.eventType.id}&timezone=${booking.timezone}`
      )
      
      if (!response.ok) throw new Error('Failed to fetch slots')
      
      const data = await response.json()
      setSlots(data.slots)
    } catch (err: any) {
      console.error('Failed to fetch slots:', err)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [booking, selectedDate])

  useEffect(() => {
    if (booking && !error) {
      fetchSlots()
    }
  }, [booking, selectedDate, fetchSlots, error])

  const handleReschedule = async () => {
    if (!selectedSlot || !booking) return

    if (!confirm('Are you sure you want to reschedule this booking?')) {
      return
    }

    setRescheduling(true)
    setError('')

    try {
      // First, cancel the old booking
      const cancelResponse = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rescheduled to new time' }),
      })

      if (!cancelResponse.ok) {
        throw new Error('Failed to cancel original booking')
      }

      // Create new booking
      const bookResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: booking.eventType.id,
          attendeeName: booking.attendeeName,
          attendeeEmail: booking.attendeeEmail,
          attendeeNotes: booking.attendeeNotes || '',
          startTime: selectedSlot.start,
          timezone: booking.timezone,
        }),
      })

      const bookData = await bookResponse.json()

      if (!bookResponse.ok) {
        throw new Error(bookData.error || 'Failed to create new booking')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule booking')
    } finally {
      setRescheduling(false)
    }
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Rescheduled!</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been successfully rescheduled. A new confirmation email has been sent to {booking?.attendeeEmail}.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-700">
              <strong>{booking?.eventType.name}</strong> with {booking?.eventType.user.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {selectedSlot && format(parseISO(selectedSlot.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-sm text-gray-600">
              {booking?.timezone}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cannot Reschedule</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-8 rounded-t-lg">
          <h1 className="text-3xl font-bold text-center">Reschedule Booking</h1>
          <p className="text-center mt-2 text-blue-100">
            Select a new time for your meeting
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-8">
          {/* Current Booking */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Current Booking</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>{booking?.eventType.name}</strong> with {booking?.eventType.user.name}
                </p>
                <p className="text-gray-600">
                  {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-gray-600">
                  {booking?.eventType.duration} minutes • {booking?.timezone}
                </p>
              </div>
            </div>
          </div>

          {!selectedSlot ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select a Date</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset) => {
                    const date = addDays(startOfDay(new Date()), offset)
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    
                    return (
                      <button
                        key={offset}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-xs text-gray-500">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(date, 'd')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(date, 'MMM')}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available Times</h3>
                
                {loadingSlots ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No available times on this date
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {slots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={!slot.available}
                        className={`px-4 py-3 rounded-lg border-2 transition ${
                          slot.available
                            ? 'border-blue-500 hover:bg-blue-50 text-blue-600 font-medium'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {format(parseISO(slot.start), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Confirmation */
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm New Time</h3>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>New Time:</strong>
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {format(parseISO(selectedSlot.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-gray-600 mt-2">
                  {booking?.eventType.duration} minutes • {booking?.timezone}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReschedule}
                  disabled={rescheduling}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
                <button
                  onClick={() => setSelectedSlot(null)}
                  disabled={rescheduling}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Choose Different Time
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6 text-center">
                Your original booking will be cancelled and a new confirmation will be sent.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => router.push(`/booking/${bookingId}`)}
              className="text-blue-600 hover:underline"
            >
              ← Back to Booking Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
