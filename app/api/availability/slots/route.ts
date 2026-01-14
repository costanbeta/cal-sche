import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateTimeSlots,
  filterAvailableSlots,
  getFutureAvailableSlots,
} from '@/lib/availability'
import { parseISO, startOfDay } from 'date-fns'

// GET /api/availability/slots
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateStr = searchParams.get('date')
    const eventTypeId = searchParams.get('eventTypeId')
    const timezone = searchParams.get('timezone') || 'UTC'
    
    if (!dateStr || !eventTypeId) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, eventTypeId' },
        { status: 400 }
      )
    }
    
    const date = parseISO(dateStr)
    
    // Get event type
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true },
    })
    
    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { error: 'Event type not found or inactive' },
        { status: 404 }
      )
    }
    
    // Get user's availability rules
    const availabilityRules = await prisma.availability.findMany({
      where: { userId: eventType.userId },
    })
    
    // Check for date overrides
    const dateOverride = await prisma.dateOverride.findFirst({
      where: {
        userId: eventType.userId,
        date: startOfDay(date),
      },
    })
    
    // If date is blocked, return empty slots
    if (dateOverride && !dateOverride.isAvailable) {
      return NextResponse.json({ slots: [] })
    }
    
    // Generate time slots
    let slots = generateTimeSlots(
      date,
      eventType.duration,
      availabilityRules.map(rule => ({
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        timezone: rule.timezone,
      })),
      timezone
    )
    
    // Get existing bookings for this day
    const startOfDayDate = startOfDay(date)
    const endOfDayDate = new Date(startOfDayDate)
    endOfDayDate.setDate(endOfDayDate.getDate() + 1)
    
    const bookings = await prisma.booking.findMany({
      where: {
        userId: eventType.userId,
        status: 'confirmed',
        startTime: {
          gte: startOfDayDate,
          lt: endOfDayDate,
        },
      },
    })
    
    // Filter out booked slots
    slots = filterAvailableSlots(
      slots,
      bookings.map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      }))
    )
    
    // Filter out past slots
    const availableSlots = getFutureAvailableSlots(slots)
    
    return NextResponse.json({
      slots: availableSlots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        available: slot.available,
      })),
    })
    
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
