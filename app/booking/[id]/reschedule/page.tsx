'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays, startOfDay, parseISO } from 'date-fns'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

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
    setRescheduling(true)
    setError('')

    try {
      const cancelResponse = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rescheduled to new time' }),
      })

      if (!cancelResponse.ok) {
        throw new Error('Failed to cancel original booking')
      }

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Rescheduled!</h1>
            <p className="text-muted-foreground mb-6">
              Your booking has been successfully rescheduled. A new confirmation email has been sent to {booking?.attendeeEmail}.
            </p>
            <div className="bg-secondary rounded-lg p-5 text-left space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">{booking?.eventType.name}</span> with {booking?.eventType.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedSlot && format(parseISO(selectedSlot.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking?.timezone}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Cannot Reschedule</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="bg-secondary rounded-lg p-5 text-left mb-6 space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">{booking.eventType.name}</span> with {booking.eventType.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/booking/${bookingId}`)}>
              Back to Booking Details
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Reschedule Booking</h1>
              <p className="text-muted-foreground mt-1">Select a new time for your meeting</p>
            </div>

            {/* Current Booking Info */}
            <div className="bg-secondary rounded-lg p-5 mb-8 space-y-2">
              <p className="text-sm text-muted-foreground">Current booking</p>
              <p className="font-medium text-foreground">
                {booking?.eventType.name} with {booking?.eventType.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking?.eventType.duration} minutes &middot; {booking?.timezone}
              </p>
            </div>

            {!selectedSlot ? (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Select a Date</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset) => {
                      const date = addDays(startOfDay(new Date()), offset)
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      
                      return (
                        <button
                          key={offset}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            'p-3 rounded-lg border transition-colors text-center',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border hover:border-primary/50'
                          )}
                        >
                          <div className={cn(
                            'text-xs',
                            isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {format(date, 'EEE')}
                          </div>
                          <div className="text-lg font-bold">
                            {format(date, 'd')}
                          </div>
                          <div className={cn(
                            'text-xs',
                            isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {format(date, 'MMM')}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Available Times</h3>
                  
                  {loadingSlots ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No available times on this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => slot.available && setSelectedSlot(slot)}
                          disabled={!slot.available}
                          className={cn(
                            'px-4 py-3 rounded-lg border transition-colors font-medium text-sm',
                            slot.available
                              ? 'border-primary text-primary hover:bg-primary/10 cursor-pointer'
                              : 'border-border text-muted-foreground cursor-not-allowed opacity-50'
                          )}
                        >
                          {format(parseISO(slot.start), 'h:mm a')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Confirmation View */
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Confirm New Time</h3>
                
                <div className="bg-secondary rounded-lg p-5 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">New Time</p>
                  <p className="text-xl font-bold text-foreground">
                    {format(parseISO(selectedSlot.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {booking?.eventType.duration} minutes &middot; {booking?.timezone}
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleReschedule}
                    disabled={rescheduling}
                    className="flex-1"
                  >
                    {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSlot(null)}
                    disabled={rescheduling}
                    className="flex-1"
                  >
                    Choose Different Time
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-6 text-center">
                  Your original booking will be cancelled and a new confirmation will be sent.
                </p>
              </div>
            )}

            {/* Back link */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <Button
                variant="ghost"
                onClick={() => router.push(`/booking/${bookingId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Booking Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
