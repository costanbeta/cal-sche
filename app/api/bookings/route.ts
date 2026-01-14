import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { bookingSchema } from '@/lib/validations'
import { addMinutes, parseISO } from 'date-fns'
import { doTimesOverlap } from '@/lib/availability'
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email'
import { createGoogleCalendarEvent } from '@/lib/google-calendar'

// GET /api/bookings - List user's bookings
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'confirmed'
    const upcoming = searchParams.get('upcoming') === 'true'
    
    const bookings = await prisma.booking.findMany({
      where: {
        userId: auth.userId,
        status: status as any,
        ...(upcoming && { startTime: { gte: new Date() } }),
      },
      include: {
        eventType: true,
      },
      orderBy: { startTime: 'asc' },
    })
    
    return NextResponse.json({ bookings })
    
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a booking (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    
    // Get event type
    const eventType = await prisma.eventType.findUnique({
      where: { id: validatedData.eventTypeId },
      include: { user: true },
    })
    
    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { error: 'Event type not found or inactive' },
        { status: 404 }
      )
    }
    
    const startTime = parseISO(validatedData.startTime)
    const endTime = addMinutes(startTime, eventType.duration)
    
    // Check if time slot is still available
    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: eventType.userId,
        status: 'confirmed',
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    })
    
    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 400 }
      )
    }
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventTypeId: validatedData.eventTypeId,
        userId: eventType.userId,
        attendeeName: validatedData.attendeeName,
        attendeeEmail: validatedData.attendeeEmail,
        attendeeNotes: validatedData.attendeeNotes,
        startTime,
        endTime,
        timezone: validatedData.timezone,
        status: 'confirmed',
      },
      include: {
        eventType: true,
      },
    })
    
    // Create Google Calendar event if user has calendar connected
    try {
      const calendarConnection = await prisma.calendarConnection.findFirst({
        where: {
          userId: eventType.userId,
          provider: 'google',
        },
      })
      
      if (calendarConnection) {
        const eventDescription = `Meeting with ${booking.attendeeName} (${booking.attendeeEmail})${
          booking.attendeeNotes ? `\n\nNotes: ${booking.attendeeNotes}` : ''
        }\n\nBooking ID: ${booking.id}`
        
        const googleEventId = await createGoogleCalendarEvent(
          calendarConnection.accessToken,
          calendarConnection.refreshToken,
          {
            summary: `${eventType.name} with ${booking.attendeeName}`,
            description: eventDescription,
            startTime: booking.startTime,
            endTime: booking.endTime,
            attendeeEmail: booking.attendeeEmail,
            timezone: booking.timezone,
          }
        )
        
        // Update booking with Google Event ID
        if (googleEventId) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleEventId },
          })
        }
      }
    } catch (calendarError) {
      console.error('Failed to create Google Calendar event:', calendarError)
      // Don't fail the booking if calendar creation fails
    }
    
    // Send confirmation emails (don't wait for them)
    try {
      await Promise.all([
        sendBookingConfirmation({
          attendeeName: booking.attendeeName,
          attendeeEmail: booking.attendeeEmail,
          hostName: eventType.user.name,
          eventName: eventType.name,
          startTime: booking.startTime,
          duration: eventType.duration,
          timezone: booking.timezone,
          bookingId: booking.id,
          attendeeNotes: booking.attendeeNotes || undefined,
          meetingLink: eventType.meetingLink || undefined,
          location: eventType.location || undefined,
        }),
        sendBookingNotification({
          attendeeName: booking.attendeeName,
          attendeeEmail: booking.attendeeEmail,
          hostName: eventType.user.name,
          hostEmail: eventType.user.email,
          eventName: eventType.name,
          startTime: booking.startTime,
          duration: eventType.duration,
          timezone: booking.timezone,
          bookingId: booking.id,
          attendeeNotes: booking.attendeeNotes || undefined,
          meetingLink: eventType.meetingLink || undefined,
          location: eventType.location || undefined,
        }),
      ])
    } catch (emailError) {
      console.error('Failed to send emails:', emailError)
      // Don't fail the booking if emails fail
    }
    
    return NextResponse.json({ booking }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create booking error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
