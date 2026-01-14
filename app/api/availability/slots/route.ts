import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateTimeSlots,
  filterAvailableSlots,
  getFutureAvailableSlots,
} from '@/lib/availability'
import { parseISO, startOfDay, endOfDay } from 'date-fns'
import { getGoogleCalendarBusyTimes } from '@/lib/google-calendar'

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
    
    // Check if user has Google Calendar connected
    const calendarConnection = await prisma.calendarConnection.findFirst({
      where: {
        userId: eventType.userId,
        provider: 'google',
      },
    })
    
    // Get Google Calendar busy times if connected
    let googleBusyTimes: Array<{ startTime: Date; endTime: Date }> = []
    if (calendarConnection) {
      try {
        const busyTimes = await getGoogleCalendarBusyTimes(
          calendarConnection.accessToken,
          calendarConnection.refreshToken,
          startOfDayDate,
          endOfDayDate
        )
        googleBusyTimes = busyTimes.map(busy => ({
          startTime: busy.start,
          endTime: busy.end,
        }))
      } catch (error) {
        console.error('Failed to fetch Google Calendar busy times:', error)
        // Continue without calendar sync
      }
    }
    
    // Combine database bookings with Google Calendar busy times
    const allBusyTimes = [
      ...bookings.map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
      ...googleBusyTimes,
    ]
    
    // Filter out booked slots
    slots = filterAvailableSlots(slots, allBusyTimes)
    
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
