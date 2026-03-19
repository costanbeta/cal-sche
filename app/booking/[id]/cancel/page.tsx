'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Cancelled</h1>
            <p className="text-muted-foreground mb-6">
              Your booking has been successfully cancelled. A confirmation email has been sent to {booking?.attendeeEmail}.
            </p>
            <div className="bg-secondary rounded-lg p-5 text-left mb-6 space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">{booking?.eventType.name}</span> with {booking?.eventType.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              If you&apos;d like to reschedule, please visit the booking page again.
            </p>
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Cannot Cancel</h1>
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Cancel Booking</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              You&apos;re about to cancel the following booking:
            </p>

            {/* Detail Box */}
            <div className="bg-secondary rounded-lg p-5 mb-6 space-y-3">
              <div>
                <p className="text-lg font-medium text-foreground">
                  {booking?.eventType.name}
                </p>
                <p className="text-muted-foreground">with {booking?.eventType.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date &amp; Time</p>
                <p className="text-foreground">
                  {booking && format(new Date(booking.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-foreground">{booking?.eventType.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendee</p>
                <p className="text-foreground">
                  {booking?.attendeeName} ({booking?.attendeeEmail})
                </p>
              </div>
            </div>

            {/* Cancellation Form */}
            <form onSubmit={handleCancel} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for cancellation (optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Let us know why you're cancelling..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={cancelling}
                  onClick={() => router.push(`/booking/${bookingId}`)}
                >
                  Keep Booking
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              Both you and the host will receive a cancellation confirmation email.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
