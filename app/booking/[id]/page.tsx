'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Link2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  meetingLink?: string
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
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      zoom: 'Zoom Meeting',
      google_meet: 'Google Meet',
      phone: 'Phone Call',
      in_person: 'In Person',
      custom: 'Video Call',
    }
    return labels[location] || location
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <CheckCircle2 className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground">{error || 'This booking could not be found.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCancelled = booking.status === 'cancelled'
  const isPast = new Date(booking.startTime) < new Date()
  const canModify = !isCancelled && !isPast

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Meeting Confirmed</h1>
              {isCancelled && (
                <Badge variant="destructive" className="mt-3">
                  This booking has been cancelled
                </Badge>
              )}
            </div>

            {/* Greeting */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Hi {booking.attendeeName},
              </h2>
              <p className="text-muted-foreground">
                Your meeting with <span className="font-medium text-foreground">{booking.eventType.user.name}</span> is confirmed!
              </p>
            </div>

            {/* Detail Box */}
            <div className="bg-secondary rounded-lg p-5 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Event</p>
                  <p className="font-medium text-foreground">{booking.eventType.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date &amp; Time</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm text-muted-foreground">{booking.eventType.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium text-foreground">{booking.timezone}</p>
                </div>
              </div>

              {booking.eventType.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {getLocationLabel(booking.eventType.location)}
                    </p>
                  </div>
                </div>
              )}

              {(booking.meetingLink || booking.eventType.meetingLink) && (
                <div className="flex items-start gap-3">
                  <Link2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Link</p>
                    <a
                      href={booking.meetingLink || booking.eventType.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline break-all"
                    >
                      {booking.meetingLink || booking.eventType.meetingLink}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Attendee Notes */}
            {booking.attendeeNotes && (
              <div className="bg-secondary rounded-lg p-5 mb-6">
                <p className="font-medium text-foreground mb-2">Your notes:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{booking.attendeeNotes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {canModify && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Button variant="destructive" asChild>
                  <Link href={`/booking/${booking.id}/cancel`}>Cancel Booking</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/booking/${booking.id}/reschedule`}>Reschedule</Link>
                </Button>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Booking ID: <span className="font-mono">{booking.id}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
