'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, Globe, MapPin, Link2, ExternalLink, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

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
    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || null }),
      })

      if (response.ok) {
        toast.success('Booking cancelled successfully')
        router.push('/dashboard/bookings')
      } else {
        toast.error('Failed to cancel booking')
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setCancelReason('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Booking not found'}</p>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Booking Details</h1>
            {booking.status === 'cancelled' && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
            {booking.status === 'confirmed' && (
              <Badge className="bg-green-500/10 text-green-500 border-transparent">
                Confirmed
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {booking.eventType.name}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {booking.eventType.duration} minutes
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time
              </h3>
              <p className="text-lg text-foreground">
                {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-foreground">
                {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Timezone: {booking.timezone}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Attendee
              </h3>
              <p className="text-lg text-foreground">{booking.attendeeName}</p>
              <p className="text-muted-foreground">{booking.attendeeEmail}</p>
            </div>

            {booking.attendeeNotes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-foreground whitespace-pre-wrap">{booking.attendeeNotes}</p>
                </div>
              </>
            )}

            {booking.eventType.location && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <p className="text-foreground flex items-center gap-2">
                    {booking.eventType.location === 'zoom' && (
                      <><Link2 className="h-4 w-4" /> Zoom Meeting</>
                    )}
                    {booking.eventType.location === 'google_meet' && (
                      <><Link2 className="h-4 w-4" /> Google Meet</>
                    )}
                    {booking.eventType.location === 'phone' && (
                      <><MapPin className="h-4 w-4" /> Phone Call</>
                    )}
                    {booking.eventType.location === 'in_person' && (
                      <><MapPin className="h-4 w-4" /> In Person</>
                    )}
                    {booking.eventType.location === 'custom' && (
                      <><Link2 className="h-4 w-4" /> Video Call</>
                    )}
                  </p>
                  {booking.eventType.meetingLink && (
                    <a
                      href={booking.eventType.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      {booking.eventType.meetingLink}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Booking ID</h3>
              <p className="text-sm text-muted-foreground font-mono">{booking.id}</p>
            </div>

            {booking.status === 'confirmed' && new Date(booking.startTime) > new Date() && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                    Cancel Booking
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking with {booking?.attendeeName}? The attendee will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Input
              id="cancel-reason"
              placeholder="e.g. Schedule conflict"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
