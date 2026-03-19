'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ExternalLink, Video } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface EventType {
  id?: string
  name: string
  duration: number
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

function formatTimezone(tz: string): string {
  const map: Record<string, string> = {
    'GMT': 'Greenwich Mean Time',
    'UTC': 'Coordinated Universal Time',
    'EST': 'Eastern Standard Time',
    'CST': 'Central Standard Time',
    'MST': 'Mountain Standard Time',
    'PST': 'Pacific Standard Time',
  }
  return map[tz] || tz
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  const fetchBookings = useCallback(async (filter: 'upcoming' | 'past' | 'cancelled') => {
    setLoading(true)
    try {
      let url = '/api/bookings?'
      if (filter === 'upcoming') {
        url += 'upcoming=true&status=confirmed'
      } else if (filter === 'cancelled') {
        url += 'status=cancelled'
      } else {
        url += 'status=confirmed'
      }

      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()

      let filteredBookings = data.bookings
      if (filter === 'past') {
        filteredBookings = filteredBookings.filter(
          (b: Booking) => new Date(b.startTime) < new Date()
        )
      }

      setBookings(filteredBookings)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchBookings(activeTab)
  }, [activeTab, fetchBookings])

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        fetchBookings(activeTab)
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'upcoming' | 'past' | 'cancelled')
  }

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        title="Bookings"
        description="View and manage your scheduled meetings"
        showSearch
      />

      <div className="flex-1 px-6 py-6">
        {loading && bookings.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl bg-accent/50 h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs
            defaultValue="upcoming"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="bg-muted/50 rounded-lg">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <BookingList
                bookings={bookings}
                loading={loading}
                showActions
                onCancel={handleCancelBooking}
                emptyMessage="No Upcoming Booking"
              />
            </TabsContent>

            <TabsContent value="past">
              <BookingList
                bookings={bookings}
                loading={loading}
                emptyMessage="No Past Bookings"
              />
            </TabsContent>

            <TabsContent value="cancelled">
              <BookingList
                bookings={bookings}
                loading={loading}
                emptyMessage="No Cancelled Bookings"
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function BookingList({
  bookings,
  loading,
  showActions,
  onCancel,
  emptyMessage,
}: {
  bookings: Booking[]
  loading: boolean
  showActions?: boolean
  onCancel?: (id: string) => void
  emptyMessage: string
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-accent/50 h-64 mt-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-accent/50 h-64 mt-4">
        <p className="text-base font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          showActions={showActions}
          onCancel={onCancel}
        />
      ))}
    </div>
  )
}

function BookingCard({
  booking,
  showActions,
  onCancel,
}: {
  booking: Booking
  showActions?: boolean
  onCancel?: (id: string) => void
}) {
  const startDate = new Date(booking.startTime)
  const endDate = new Date(booking.endTime)
  const hostName = 'You'

  const dateTimeString = `${format(startDate, 'EEEE, MMMM d, yyyy h:mm a')} - ${format(endDate, 'h:mm a')} (${formatTimezone(booking.timezone)})`

  return (
    <div className="border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <h3 className="text-base font-medium text-foreground">
            {booking.eventType.duration} Min Meeting between {hostName} and{' '}
            {booking.attendeeName}
          </h3>

          <p className="text-sm text-muted-foreground">{dateTimeString}</p>

          {booking.meetingLink && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {booking.meetingLink}
              </a>
              <ExternalLink className="h-3 w-3" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="default">You</Badge>
            <Badge variant="outline">{booking.attendeeEmail}</Badge>
          </div>

          {booking.attendeeNotes && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span>{' '}
              {booking.attendeeNotes}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex flex-col gap-2 shrink-0">
            <Button variant="outline" size="sm">
              Start
            </Button>
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-transparent text-destructive hover:bg-destructive/10 border-none shadow-none"
              onClick={() => onCancel?.(booking.id)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
