import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { sendCancellationEmail } from '@/lib/email'

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
