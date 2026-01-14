export interface User {
  id: string
  email: string
  name: string
  username: string
  timezone: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface EventType {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  isActive: boolean
  location?: string
  meetingLink?: string
  createdAt: Date
  updatedAt: Date
}

export interface Availability {
  id: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  timezone: string
  createdAt: Date
}

export interface Booking {
  id: string
  eventTypeId: string
  userId: string
  attendeeName: string
  attendeeEmail: string
  attendeeNotes?: string
  startTime: Date
  endTime: Date
  timezone: string
  status: 'confirmed' | 'cancelled' | 'completed'
  googleEventId?: string
  cancellationReason?: string
  createdAt: Date
  updatedAt: Date
  eventType?: EventType
}

export interface DateOverride {
  id: string
  userId: string
  date: Date
  isAvailable: boolean
  startTime?: string
  endTime?: string
  createdAt: Date
}

export interface CalendarConnection {
  id: string
  userId: string
  provider: 'google' | 'outlook'
  accessToken: string
  refreshToken: string
  tokenExpiresAt?: Date
  calendarId?: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}
