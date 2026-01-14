import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { sendCancellationEmail } from '@/lib/email'
import { deleteGoogleCalendarEvent } from '@/lib/google-calendar'

// PUT /api/bookings/[id]/cancel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reason } = body
    
    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        eventType: {
          include: { user: true },
        },
      },
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking already cancelled' },
        { status: 400 }
      )
    }
    
    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
    })
    
    // Delete Google Calendar event if it exists
    if (booking.googleEventId) {
      try {
        const calendarConnection = await prisma.calendarConnection.findFirst({
          where: {
            userId: booking.userId,
            provider: 'google',
          },
        })
        
        if (calendarConnection) {
          await deleteGoogleCalendarEvent(
            calendarConnection.accessToken,
            calendarConnection.refreshToken,
            booking.googleEventId
          )
        }
      } catch (calendarError) {
        console.error('Failed to delete Google Calendar event:', calendarError)
        // Don't fail the cancellation if calendar deletion fails
      }
    }
    
    // Send cancellation email
    try {
      await sendCancellationEmail(
        booking.attendeeEmail,
        booking.attendeeName,
        booking.eventType.user.name,
        booking.eventType.name,
        reason
      )
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }
    
    return NextResponse.json({ booking: updatedBooking })
    
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
