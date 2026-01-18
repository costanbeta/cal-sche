'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays, startOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

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

interface BrandingSettings {
  brandLogoUrl?: string
  brandColor?: string
  brandName?: string
  hidePoweredBy?: boolean
  customFooterText?: string
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
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'12h' | '24h'>('12h')
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  )
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeeNotes: '',
    additionalGuests: [] as string[],
  })
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  // Common timezones grouped by region
  const commonTimezones = [
    { label: 'Asia/Kolkata (IST GMT +5:30)', value: 'Asia/Kolkata' },
    { label: 'Asia/Dubai (GST GMT +4:00)', value: 'Asia/Dubai' },
    { label: 'Europe/London (GMT +0:00)', value: 'Europe/London' },
    { label: 'Europe/Paris (CET GMT +1:00)', value: 'Europe/Paris' },
    { label: 'America/New_York (EST GMT -5:00)', value: 'America/New_York' },
    { label: 'America/Chicago (CST GMT -6:00)', value: 'America/Chicago' },
    { label: 'America/Los_Angeles (PST GMT -8:00)', value: 'America/Los_Angeles' },
    { label: 'Asia/Tokyo (JST GMT +9:00)', value: 'Asia/Tokyo' },
    { label: 'Asia/Shanghai (CST GMT +8:00)', value: 'Asia/Shanghai' },
    { label: 'Asia/Singapore (SGT GMT +8:00)', value: 'Asia/Singapore' },
    { label: 'Australia/Sydney (AEDT GMT +11:00)', value: 'Australia/Sydney' },
    { label: 'Pacific/Auckland (NZDT GMT +13:00)', value: 'Pacific/Auckland' },
  ]

  const fetchEventType = useCallback(async () => {
    try {
      const [eventRes, userRes] = await Promise.all([
        fetch(`/api/users/${username}/events/${slug}`),
        fetch(`/api/users/${username}`)
      ])
      
      if (!eventRes.ok) throw new Error('Event type not found')
      
      const eventData = await eventRes.json()
      setEventType(eventData.eventType)

      if (userRes.ok) {
        const userData = await userRes.json()
        setBranding(userData.branding || null)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [username, slug])

  const fetchSlots = useCallback(async () => {
    if (!eventType) return
    
    setLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability/slots?date=${dateStr}&eventTypeId=${eventType.id}&timezone=${selectedTimezone}`
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
  }, [eventType, selectedDate, selectedTimezone])

  useEffect(() => {
    fetchEventType()
  }, [fetchEventType])

  useEffect(() => {
    if (eventType) {
      fetchSlots()
    }
  }, [eventType, fetchSlots])

  // Close timezone dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTimezoneDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('.timezone-selector')) {
          setShowTimezoneDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTimezoneDropdown])

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
          timezone: selectedTimezone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      setBookingDetails({
        title: `${eventType.name} between ${eventType.user.name} and ${formData.attendeeName}`,
        when: selectedSlot.start,
        attendeeName: formData.attendeeName,
        attendeeEmail: formData.attendeeEmail,
        hostName: eventType.user.name,
        hostEmail: eventType.user.username,
        location: eventType.location,
        meetingLink: eventType.meetingLink,
        notes: formData.attendeeNotes,
      })
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

  if (success && bookingDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-800">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            This meeting is scheduled
          </h1>
          <p className="text-gray-400 text-center mb-8">
            We sent an email with a calendar invitation with the details to everyone.
          </p>

          {/* Meeting Details */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-gray-800">
              <span className="text-gray-400">What</span>
              <span className="text-white font-medium">{bookingDetails.title}</span>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-gray-800">
              <span className="text-gray-400">When</span>
              <div className="text-white">
                <div className="font-medium">
                  {format(parseISO(bookingDetails.when), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-gray-400 text-sm">
                  {format(parseISO(bookingDetails.when), 'h:mm a')} - {format(new Date(new Date(bookingDetails.when).getTime() + eventType!.duration * 60000), 'h:mm a')} ({selectedTimezone})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-gray-800">
              <span className="text-gray-400">Who</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {bookingDetails.hostName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white flex items-center gap-2">
                      {bookingDetails.hostName}
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Host</span>
                    </div>
                    <div className="text-gray-400 text-sm">{bookingDetails.hostEmail}@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                    {bookingDetails.attendeeName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white">{bookingDetails.attendeeName}</div>
                    <div className="text-gray-400 text-sm">{bookingDetails.attendeeEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-gray-800">
              <span className="text-gray-400">Where</span>
              {bookingDetails.meetingLink ? (
                <a 
                  href={bookingDetails.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  {bookingDetails.location === 'zoom' && 'Video Call'}
                  {bookingDetails.location === 'google_meet' && 'Google Meet'}
                  {bookingDetails.location === 'phone' && 'Phone Call'}
                  {bookingDetails.location === 'in_person' && 'In Person Meeting'}
                  {bookingDetails.location === 'custom' && 'Video Call'}
                  {!bookingDetails.location && 'Video Call'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span className="text-white">
                  {bookingDetails.location === 'zoom' && 'Video Call'}
                  {bookingDetails.location === 'google_meet' && 'Google Meet'}
                  {bookingDetails.location === 'phone' && 'Phone Call'}
                  {bookingDetails.location === 'in_person' && 'In Person Meeting'}
                  {bookingDetails.location === 'custom' && 'Video Call'}
                  {!bookingDetails.location && 'Video Call'}
                </span>
              )}
            </div>

            {bookingDetails.notes && (
              <div className="grid grid-cols-[100px_1fr] gap-4 py-3">
                <span className="text-gray-400">Additional notes</span>
                <span className="text-white">{bookingDetails.notes}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Need to make a change?{' '}
              <button className="text-blue-500 hover:underline">Reschedule</button>
              {' '}or{' '}
              <button className="text-blue-500 hover:underline">Cancel</button>
            </div>
          </div>

          {/* Calendar Integration */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-800">
            <span className="text-gray-400 text-sm">Add to calendar</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-lg bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-center transition">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.945 11C20.484 6.054 16.41 2 11.5 2S2.516 6.054 2.055 11H0v2h2.055C2.516 17.946 6.59 22 11.5 22s8.984-4.054 9.445-9h2.055v-2h-2.055zM11.5 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                  <path d="M12 7h-1v6h6v-1h-5z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-lg bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-center transition">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-lg bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-center transition">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-lg bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-center transition">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get calendar days for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {!showForm ? (
          <>
            {/* Left Side - Profile & Event Info */}
            <div className="lg:w-[400px] bg-[#0a0a0a] p-8 border-r border-gray-800">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 mb-8">
                {branding?.brandLogoUrl ? (
                  <img 
                    src={branding.brandLogoUrl} 
                    alt={eventType?.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-lg font-bold">
                    {eventType?.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-semibold">{eventType?.user.name}</h2>
                </div>
              </div>

              {/* Event Details */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {eventType?.name}
              </h1>

              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{eventType?.duration}m</span>
                </div>

                {eventType?.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Timezone Selector */}
                <div className="relative timezone-selector">
                  <button
                    onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                    className="flex items-center gap-2 w-full hover:text-gray-300 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-left truncate">{selectedTimezone.split('/')[1]?.replace('_', ' ')}</span>
                    <svg className={`w-4 h-4 transition-transform ${showTimezoneDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Timezone Dropdown */}
                  {showTimezoneDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50 scrollbar-thin">
                      {commonTimezones.map((tz) => (
                        <button
                          key={tz.value}
                          onClick={() => {
                            setSelectedTimezone(tz.value)
                            setShowTimezoneDropdown(false)
                          }}
                          className={`
                            w-full px-4 py-3 text-left text-sm hover:bg-[#242424] transition flex items-center justify-between
                            ${selectedTimezone === tz.value ? 'bg-[#242424] text-white' : 'text-gray-400'}
                          `}
                        >
                          <span>{tz.label}</span>
                          {selectedTimezone === tz.value && (
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Calendar & Time Slots */}
            <div className="flex-1 bg-[#0a0a0a] p-8">
              <div className="max-w-4xl">
                {/* Header - Select Date & Time */}
                <h2 className="text-xl font-semibold text-white mb-6">Select a Date & Time</h2>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={goToPreviousMonth}
                          className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] flex items-center justify-center transition text-gray-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={goToNextMonth}
                          className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] flex items-center justify-center transition text-gray-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      
                      {/* Calendar days */}
                      {calendarDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate)
                        const isToday = isSameDay(day, new Date())
                        const isPast = day < startOfDay(new Date())
                        const isInMonth = isSameMonth(day, currentMonth)
                        
                        return (
                          <button
                            key={day.toString()}
                            onClick={() => {
                              if (!isPast && isInMonth) {
                                setSelectedDate(day)
                              }
                            }}
                            disabled={isPast || !isInMonth}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition
                              ${isSelected 
                                ? 'bg-white text-black' 
                                : isPast || !isInMonth
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-300 hover:bg-[#1a1a1a]'
                              }
                              ${isToday && !isSelected ? 'border border-gray-600' : ''}
                            `}
                          >
                            {format(day, 'd')}
                            {isToday && !isSelected && <span className="absolute w-1 h-1 bg-blue-500 rounded-full mt-8"></span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white font-medium">
                        <span className="text-gray-400">Mon</span> {format(selectedDate, 'd')}
                      </div>
                      <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('12h')}
                          className={`px-3 py-1 rounded text-sm transition ${
                            viewMode === '12h' ? 'bg-[#242424] text-white' : 'text-gray-400'
                          }`}
                        >
                          12h
                        </button>
                        <button
                          onClick={() => setViewMode('24h')}
                          className={`px-3 py-1 rounded text-sm transition ${
                            viewMode === '24h' ? 'bg-[#242424] text-white' : 'text-gray-400'
                          }`}
                        >
                          24h
                        </button>
                      </div>
                    </div>

                    {loadingSlots ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        Loading slots...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No available times
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {slots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`
                              w-full px-4 py-3 rounded-lg border transition text-left
                              ${slot.available
                                ? 'border-gray-700 hover:border-gray-500 text-white hover:bg-[#1a1a1a]'
                                : 'border-gray-800 text-gray-600 cursor-not-allowed'
                              }
                            `}
                          >
                            {viewMode === '12h' 
                              ? format(parseISO(slot.start), 'h:mm a')
                              : format(parseISO(slot.start), 'HH:mm')
                            }
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Booking Form */
          <div className="flex-1 bg-[#0a0a0a]">
            <div className="grid lg:grid-cols-2 min-h-screen">
              {/* Left - Meeting Summary */}
              <div className="bg-[#0a0a0a] p-8 border-r border-gray-800">
                <div className="sticky top-8">
                  {/* Profile */}
                  <div className="flex items-center gap-4 mb-8">
                    {branding?.brandLogoUrl ? (
                      <img 
                        src={branding.brandLogoUrl} 
                        alt={eventType?.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-lg font-bold">
                        {eventType?.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold">{eventType?.user.name}</h3>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">{eventType?.name}</h2>

                  <div className="space-y-4 text-gray-400">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-white">
                        <div className="font-medium">
                          {selectedSlot && format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                        </div>
                <div className="text-sm text-gray-400">
                  {selectedSlot && format(parseISO(selectedSlot.start), 'h:mm a')} - {selectedSlot && format(new Date(new Date(selectedSlot.start).getTime() + (eventType?.duration || 30) * 60000), 'h:mm a')} ({selectedTimezone})
                </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white">{eventType?.duration}m</span>
                    </div>

                    {eventType?.location && (
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="text-white">
                          {eventType.location === 'zoom' && 'Video Call'}
                          {eventType.location === 'google_meet' && 'Google Meet'}
                          {eventType.location === 'phone' && 'Phone'}
                          {eventType.location === 'in_person' && 'In Person'}
                          {eventType.location === 'custom' && 'Video Call'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white">{selectedTimezone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div className="bg-[#0a0a0a] p-8">
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Enter Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.attendeeName}
                      onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.attendeeEmail}
                      onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Additional notes
                    </label>
                    <textarea
                      value={formData.attendeeNotes}
                      onChange={(e) => setFormData({ ...formData, attendeeNotes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition resize-none"
                      placeholder="Please share anything that will help prepare for our meeting."
                    />
                  </div>

                  <button
                    type="button"
                    className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add guests
                  </button>

                  <div className="pt-6 border-t border-gray-800">
                    <p className="text-sm text-gray-400 mb-4">
                      By proceeding, you agree to our{' '}
                      <a href="#" className="text-blue-500 hover:underline">Terms</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-6 py-3 bg-[#1a1a1a] border border-gray-800 text-white rounded-lg font-medium hover:bg-[#242424] transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Booking...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
