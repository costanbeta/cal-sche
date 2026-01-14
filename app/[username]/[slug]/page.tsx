'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays, startOfDay, parseISO } from 'date-fns'

interface EventType {
  id: string
  name: string
  description?: string
  duration: number
  color: string
  user: {
    name: string
    username: string
    timezone: string
  }
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export default function BookingPage() {
  const params = useParams()
  const username = params.username as string
  const slug = params.slug as string

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeeNotes: '',
  })
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchEventType()
  }, [username, slug])

  useEffect(() => {
    if (eventType) {
      fetchSlots()
    }
  }, [selectedDate, eventType])

  const fetchEventType = async () => {
    try {
      const response = await fetch(`/api/users/${username}/events/${slug}`)
      if (!response.ok) throw new Error('Event type not found')
      
      const data = await response.json()
      setEventType(data.eventType)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    if (!eventType) return
    
    setLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability/slots?date=${dateStr}&eventTypeId=${eventType.id}&timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`
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
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowForm(true)
  }

  const handleBack = () => {
    setShowForm(false)
    setSelectedSlot(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !eventType) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          attendeeName: formData.attendeeName,
          attendeeEmail: formData.attendeeEmail,
          attendeeNotes: formData.attendeeNotes,
          startTime: selectedSlot.start,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error && !eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            You&apos;re all set! A confirmation email has been sent to {formData.attendeeEmail}
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-700">
              <strong>{eventType?.name}</strong> with {eventType?.user.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {selectedSlot && format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              {selectedSlot && format(parseISO(selectedSlot.start), 'h:mm a')} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </p>
            {eventType?.meetingLink && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Meeting Link:</p>
                <a 
                  href={eventType.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {eventType.meetingLink}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {!showForm ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Info */}
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {eventType?.user.name}
                </h1>
                <h2 className="text-xl text-gray-700 mb-4">{eventType?.name}</h2>
                {eventType?.description && (
                  <p className="text-gray-600 mb-4">{eventType.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>⏱️</span>
                    <span>{eventType?.duration} minutes</span>
                  </div>
                  {eventType?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>
                        {eventType.location === 'zoom' && '📹'}
                        {eventType.location === 'google_meet' && '📹'}
                        {eventType.location === 'phone' && '📞'}
                        {eventType.location === 'in_person' && '🏢'}
                        {eventType.location === 'custom' && '🔗'}
                      </span>
                      <span>
                        {eventType.location === 'zoom' && 'Zoom Meeting'}
                        {eventType.location === 'google_meet' && 'Google Meet'}
                        {eventType.location === 'phone' && 'Phone Call'}
                        {eventType.location === 'in_person' && 'In Person'}
                        {eventType.location === 'custom' && 'Video Call'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select a Date & Time</h3>
                
                {/* Simple Date Selector */}
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((offset) => {
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

                {/* Time Slots */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Available Times
                  </h4>
                  
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
                          onClick={() => handleSlotSelect(slot)}
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
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 mb-6"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {eventType?.name}
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedSlot && format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy @ h:mm a')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.attendeeName}
                    onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.attendeeEmail}
                    onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.attendeeNotes}
                    onChange={(e) => setFormData({ ...formData, attendeeNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Anything you'd like the host to know..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
