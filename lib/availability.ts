import {
  addMinutes,
  format,
  parse,
  startOfDay,
  endOfDay,
  isWithinInterval,
  areIntervalsOverlapping,
  parseISO,
} from 'date-fns'

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}

export interface AvailabilityRule {
  dayOfWeek: number
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  timezone: string
}

export interface Booking {
  startTime: Date
  endTime: Date
}

/**
 * Generate time slots for a given day based on availability rules
 */
export function generateTimeSlots(
  date: Date,
  duration: number, // in minutes
  availabilityRules: AvailabilityRule[],
  timezone: string
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const dayOfWeek = date.getDay()
  
  // Find availability rule for this day
  const rule = availabilityRules.find(r => r.dayOfWeek === dayOfWeek)
  
  if (!rule) {
    return [] // No availability on this day
  }
  
  // Parse start and end times
  const [startHour, startMinute] = rule.startTime.split(':').map(Number)
  const [endHour, endMinute] = rule.endTime.split(':').map(Number)
  
  // Create date objects in the user's timezone
  let currentSlotStart = new Date(date)
  currentSlotStart.setHours(startHour, startMinute, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(endHour, endMinute, 0, 0)
  
  // Generate slots
  while (currentSlotStart < dayEnd) {
    const slotEnd = addMinutes(currentSlotStart, duration)
    
    if (slotEnd <= dayEnd) {
      slots.push({
        start: new Date(currentSlotStart),
        end: slotEnd,
        available: true,
      })
    }
    
    currentSlotStart = slotEnd
  }
  
  return slots
}

/**
 * Filter out slots that conflict with existing bookings
 */
export function filterAvailableSlots(
  slots: TimeSlot[],
  bookings: Booking[]
): TimeSlot[] {
  return slots.map(slot => {
    const hasConflict = bookings.some(booking => {
      return areIntervalsOverlapping(
        { start: slot.start, end: slot.end },
        { start: booking.startTime, end: booking.endTime },
        { inclusive: false }
      )
    })
    
    return {
      ...slot,
      available: !hasConflict,
    }
  })
}

/**
 * Check if a time slot is in the past
 */
export function isPastSlot(slot: TimeSlot): boolean {
  return slot.start < new Date()
}

/**
 * Filter out past slots and only return future available slots
 */
export function getFutureAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
  const now = new Date()
  return slots.filter(slot => slot.available && slot.start > now)
}

/**
 * Convert a time string from one timezone to another
 */
export function convertTimezone(
  dateTime: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  // Simplified timezone conversion - returns the date as-is
  // In a production app, you'd use a library like date-fns-tz or luxon
  return dateTime
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: TimeSlot, timezone: string): string {
  const startTime = format(slot.start, 'h:mm a')
  return startTime
}

/**
 * Check if two time ranges overlap
 */
export function doTimesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return areIntervalsOverlapping(
    { start: start1, end: end1 },
    { start: start2, end: end2 },
    { inclusive: false }
  )
}

/**
 * Get the next available date with slots
 */
export function getNextAvailableDate(
  startDate: Date,
  availabilityRules: AvailabilityRule[],
  maxDaysToCheck: number = 60
): Date | null {
  const currentDate = new Date(startDate)
  
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dayOfWeek = currentDate.getDay()
    const hasAvailability = availabilityRules.some(
      rule => rule.dayOfWeek === dayOfWeek
    )
    
    if (hasAvailability) {
      return currentDate
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return null
}
