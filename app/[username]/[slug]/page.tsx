'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { format, addDays, startOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Clock, Calendar, Globe, Video, Phone, Building2, ChevronLeft, ChevronRight, Plus, Check, ExternalLink, ArrowLeft, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    return 'UTC'
  })
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeeNotes: '',
    additionalGuests: [] as string[],
  })
  const [showGuestInput, setShowGuestInput] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  const timezoneDisplayNames: Record<string, string> = {
    'Asia/Kolkata': 'India',
    'Asia/Colombo': 'Sri Lanka',
    'Asia/Dubai': 'UAE',
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Asia/Singapore': 'Singapore',
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Seoul': 'South Korea',
    'Asia/Bangkok': 'Thailand',
    'Asia/Jakarta': 'Indonesia',
    'Asia/Karachi': 'Pakistan',
    'Asia/Dhaka': 'Bangladesh',
    'Asia/Kathmandu': 'Nepal',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Europe/Moscow': 'Russia',
    'Europe/Istanbul': 'Turkey',
    'America/New_York': 'United States (East)',
    'America/Chicago': 'United States (Central)',
    'America/Denver': 'United States (Mountain)',
    'America/Los_Angeles': 'United States (West)',
    'America/Toronto': 'Canada (East)',
    'America/Vancouver': 'Canada (West)',
    'America/Sao_Paulo': 'Brazil',
    'America/Mexico_City': 'Mexico',
    'Australia/Sydney': 'Australia (East)',
    'Australia/Perth': 'Australia (West)',
    'Pacific/Auckland': 'New Zealand',
    'Africa/Cairo': 'Egypt',
    'Africa/Lagos': 'Nigeria',
    'Africa/Johannesburg': 'South Africa',
  }

  const getTimezoneOffset = (tz: string) => {
    try {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
      const parts = formatter.formatToParts(now)
      const offsetPart = parts.find(p => p.type === 'timeZoneName')
      return offsetPart?.value?.replace('GMT', 'GMT ') || ''
    } catch {
      return ''
    }
  }

  const getTimezoneDisplayName = (tz: string) => {
    return timezoneDisplayNames[tz] || tz.split('/').pop()?.replace(/_/g, ' ') || tz
  }

  const commonTimezones = [
    { label: 'India', offset: 'IST GMT +5:30', value: 'Asia/Kolkata' },
    { label: 'UAE', offset: 'GST GMT +4:00', value: 'Asia/Dubai' },
    { label: 'United Kingdom', offset: 'GMT +0:00', value: 'Europe/London' },
    { label: 'France', offset: 'CET GMT +1:00', value: 'Europe/Paris' },
    { label: 'United States (East)', offset: 'EST GMT -5:00', value: 'America/New_York' },
    { label: 'United States (Central)', offset: 'CST GMT -6:00', value: 'America/Chicago' },
    { label: 'United States (West)', offset: 'PST GMT -8:00', value: 'America/Los_Angeles' },
    { label: 'Japan', offset: 'JST GMT +9:00', value: 'Asia/Tokyo' },
    { label: 'China', offset: 'CST GMT +8:00', value: 'Asia/Shanghai' },
    { label: 'Singapore', offset: 'SGT GMT +8:00', value: 'Asia/Singapore' },
    { label: 'Australia (East)', offset: 'AEDT GMT +11:00', value: 'Australia/Sydney' },
    { label: 'New Zealand', offset: 'NZDT GMT +13:00', value: 'Pacific/Auckland' },
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
        id: data.booking?.id || data.id,
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && bookingDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-border">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-foreground" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground text-center mb-2">
              This meeting is scheduled
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              We sent an email with a calendar invitation with the details to everyone.
            </p>

            {/* Meeting Details */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-border">
                <span className="text-muted-foreground">What</span>
                <span className="text-foreground font-medium">{bookingDetails.title}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-border">
                <span className="text-muted-foreground">When</span>
                <div className="text-foreground">
                  <div className="font-medium">
                    {format(parseISO(bookingDetails.when), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {format(parseISO(bookingDetails.when), 'h:mm a')} - {format(new Date(new Date(bookingDetails.when).getTime() + eventType!.duration * 60000), 'h:mm a')} ({selectedTimezone})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-border">
                <span className="text-muted-foreground">Who</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {bookingDetails.hostName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-foreground flex items-center gap-2">
                        {bookingDetails.hostName}
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Host</span>
                      </div>
                      <div className="text-muted-foreground text-sm">{bookingDetails.hostEmail}@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-bold">
                      {bookingDetails.attendeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-foreground">{bookingDetails.attendeeName}</div>
                      <div className="text-muted-foreground text-sm">{bookingDetails.attendeeEmail}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 py-3 border-b border-border">
                <span className="text-muted-foreground">Where</span>
                {bookingDetails.meetingLink ? (
                  <a 
                    href={bookingDetails.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {bookingDetails.location === 'zoom' && 'Video Call'}
                    {bookingDetails.location === 'google_meet' && 'Google Meet'}
                    {bookingDetails.location === 'phone' && 'Phone Call'}
                    {bookingDetails.location === 'in_person' && 'In Person Meeting'}
                    {bookingDetails.location === 'custom' && 'Video Call'}
                    {!bookingDetails.location && 'Video Call'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-foreground">
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
                  <span className="text-muted-foreground">Additional notes</span>
                  <span className="text-foreground">{bookingDetails.notes}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Need to make a change?{' '}
                <a href={`/booking/${bookingDetails.id}/reschedule`} className="text-primary hover:underline">Reschedule</a>
                {' '}or{' '}
                <a href={`/booking/${bookingDetails.id}/cancel`} className="text-primary hover:underline">Cancel</a>
              </div>
            </div>

          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {!showForm ? (
          <>
            {/* Left Side - Profile & Event Info */}
            <div className="lg:w-[400px] bg-background p-8 border-r border-border">
              {/* Profile Picture */}
              <div className="flex items-center gap-4 mb-8">
                {branding?.brandLogoUrl ? (
                  <Image 
                    src={branding.brandLogoUrl} 
                    alt={eventType?.user.name || ''}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground text-lg font-bold">
                    {eventType?.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-foreground font-semibold">{eventType?.user.name}</h2>
                </div>
              </div>

              {/* Event Details */}
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {eventType?.name}
              </h1>

              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{eventType?.duration}m</span>
                </div>

                {eventType?.location && (
                  <div className="flex items-center gap-2">
                    {(eventType.location === 'zoom' || eventType.location === 'google_meet' || eventType.location === 'custom') && (
                      <Video className="w-5 h-5" />
                    )}
                    {eventType.location === 'phone' && (
                      <Phone className="w-5 h-5" />
                    )}
                    {eventType.location === 'in_person' && (
                      <Building2 className="w-5 h-5" />
                    )}
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
                    className="flex items-center gap-2 w-full hover:text-muted-foreground/80 transition"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="flex-1 text-left truncate">{getTimezoneDisplayName(selectedTimezone)}</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showTimezoneDropdown && 'rotate-180')} />
                  </button>

                  {/* Timezone Dropdown */}
                  {showTimezoneDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto z-50 scrollbar-thin">
                      {(() => {
                        const userTzInList = commonTimezones.some(tz => tz.value === selectedTimezone)
                        const allTimezones = userTzInList
                          ? commonTimezones
                          : [
                              { label: getTimezoneDisplayName(selectedTimezone), offset: getTimezoneOffset(selectedTimezone), value: selectedTimezone },
                              ...commonTimezones,
                            ]
                        return allTimezones.map((tz) => (
                          <button
                            key={tz.value}
                            onClick={() => {
                              setSelectedTimezone(tz.value)
                              setShowTimezoneDropdown(false)
                            }}
                            className={cn(
                              'w-full px-4 py-3 text-left text-sm hover:bg-accent transition flex items-center justify-between',
                              selectedTimezone === tz.value ? 'bg-accent text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            <span>{tz.label} ({tz.offset})</span>
                            {selectedTimezone === tz.value && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </button>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Calendar & Time Slots */}
            <div className="flex-1 bg-background p-8">
              <div className="max-w-4xl">
                {/* Header - Select Date & Time */}
                <h2 className="text-xl font-semibold text-foreground mb-6">Select a Date & Time</h2>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={goToPreviousMonth}
                          className="w-8 h-8 rounded-lg bg-card hover:bg-accent flex items-center justify-center transition text-muted-foreground"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={goToNextMonth}
                          className="w-8 h-8 rounded-lg bg-card hover:bg-accent flex items-center justify-center transition text-muted-foreground"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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
                            className={cn(
                              'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition',
                              isSelected
                                ? 'bg-white text-black'
                                : isPast || !isInMonth
                                  ? 'text-muted-foreground/50 cursor-not-allowed'
                                  : 'text-muted-foreground hover:bg-card',
                              isToday && !isSelected && 'border border-border'
                            )}
                          >
                            {format(day, 'd')}
                            {isToday && !isSelected && <span className="absolute w-1 h-1 bg-primary rounded-full mt-8"></span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-foreground font-medium">
                        <span className="text-muted-foreground">Mon</span> {format(selectedDate, 'd')}
                      </div>
                      <div className="flex gap-1 bg-card rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('12h')}
                          className={cn(
                            'px-3 py-1 rounded text-sm transition',
                            viewMode === '12h' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          12h
                        </button>
                        <button
                          onClick={() => setViewMode('24h')}
                          className={cn(
                            'px-3 py-1 rounded text-sm transition',
                            viewMode === '24h' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          24h
                        </button>
                      </div>
                    </div>

                    {loadingSlots ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border mx-auto mb-2"></div>
                        Loading slots...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No available times
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {slots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                            className={cn(
                              'w-full px-4 py-3 rounded-lg border transition text-left',
                              slot.available
                                ? 'border-border hover:border-border/80 text-foreground hover:bg-card'
                                : 'border-border text-muted-foreground/50 cursor-not-allowed'
                            )}
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
          <div className="flex-1 bg-background">
            <div className="grid lg:grid-cols-2 min-h-screen">
              {/* Left - Meeting Summary */}
              <div className="bg-background p-8 border-r border-border">
                <div className="sticky top-8">
                  {/* Profile */}
                  <div className="flex items-center gap-4 mb-8">
                    {branding?.brandLogoUrl ? (
                      <Image 
                        src={branding.brandLogoUrl} 
                        alt={eventType?.user.name || ''}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground text-lg font-bold">
                        {eventType?.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-foreground font-semibold">{eventType?.user.name}</h3>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-6">{eventType?.name}</h2>

                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Calendar className="w-5 h-5" />
                      <div className="text-foreground">
                        <div className="font-medium">
                          {selectedSlot && format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedSlot && format(parseISO(selectedSlot.start), 'h:mm a')} - {selectedSlot && format(new Date(new Date(selectedSlot.start).getTime() + (eventType?.duration || 30) * 60000), 'h:mm a')} ({selectedTimezone})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Clock className="w-5 h-5" />
                      <span className="text-foreground">{eventType?.duration}m</span>
                    </div>

                    {eventType?.location && (
                      <div className="flex items-center gap-3 pb-4 border-b border-border">
                        {(eventType.location === 'zoom' || eventType.location === 'google_meet' || eventType.location === 'custom') && (
                          <Video className="w-5 h-5" />
                        )}
                        {eventType.location === 'phone' && (
                          <Phone className="w-5 h-5" />
                        )}
                        {eventType.location === 'in_person' && (
                          <Building2 className="w-5 h-5" />
                        )}
                        <span className="text-foreground">
                          {eventType.location === 'zoom' && 'Video Call'}
                          {eventType.location === 'google_meet' && 'Google Meet'}
                          {eventType.location === 'phone' && 'Phone'}
                          {eventType.location === 'in_person' && 'In Person'}
                          {eventType.location === 'custom' && 'Video Call'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <span className="text-foreground">{selectedTimezone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div className="bg-background p-8">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 px-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>

                <h2 className="text-2xl font-bold text-foreground mb-6">Enter Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <Label className="block text-sm font-medium text-muted-foreground mb-2">
                      Your name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      required
                      value={formData.attendeeName}
                      onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                      className="w-full px-4 py-3 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-border/80 transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      value={formData.attendeeEmail}
                      onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-border/80 transition"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-muted-foreground mb-2">
                      Additional notes
                    </Label>
                    <Textarea
                      value={formData.attendeeNotes}
                      onChange={(e) => setFormData({ ...formData, attendeeNotes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-border/80 transition resize-none"
                      placeholder="Please share anything that will help prepare for our meeting."
                    />
                  </div>

                  {formData.additionalGuests.length > 0 && (
                    <div className="space-y-2">
                      <Label className="block text-sm font-medium text-muted-foreground">
                        Guests
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.additionalGuests.map((guest, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-sm px-3 py-1.5 rounded-full"
                          >
                            {guest}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  additionalGuests: prev.additionalGuests.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-muted-foreground hover:text-foreground transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showGuestInput ? (
                    <div className="space-y-2">
                      <Label className="block text-sm font-medium text-muted-foreground">
                        Guest email
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const email = guestEmail.trim()
                              if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                setFormData(prev => {
                                  if (prev.additionalGuests.includes(email)) return prev
                                  return { ...prev, additionalGuests: [...prev.additionalGuests, email] }
                                })
                                setGuestEmail('')
                              }
                            }
                          }}
                          className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
                          placeholder="guest@example.com"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const email = guestEmail.trim()
                            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                              setFormData(prev => {
                                if (prev.additionalGuests.includes(email)) return prev
                                return { ...prev, additionalGuests: [...prev.additionalGuests, email] }
                              })
                              setGuestEmail('')
                            }
                          }}
                          className="bg-white text-black hover:bg-neutral-200"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowGuestInput(false)
                            setGuestEmail('')
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowGuestInput(true)}
                      className="text-primary hover:text-primary/80 text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add guests
                    </button>
                  )}

                  <div className="pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      By proceeding, you agree to our{' '}
                      <a href="#" className="text-primary hover:underline">Terms</a>
                      {' '}and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 px-6 py-3 bg-card border-border text-foreground hover:bg-accent transition"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-white text-black hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Booking...' : 'Confirm'}
                      </Button>
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
