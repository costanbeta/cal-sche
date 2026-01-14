import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const eventTypeSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration must be less than 4 hours'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
  isActive: z.boolean().default(true),
  location: z.enum(['zoom', 'google_meet', 'phone', 'in_person', 'custom', '']).optional(),
  meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  timezone: z.string().default('UTC'),
})

export const bookingSchema = z.object({
  eventTypeId: z.string().uuid(),
  attendeeName: z.string().min(2, 'Name must be at least 2 characters'),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeeNotes: z.string().optional(),
  startTime: z.string().datetime(),
  timezone: z.string(),
})

export const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  isAvailable: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
})
