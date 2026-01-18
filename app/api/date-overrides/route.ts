import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { z } from 'zod'
import { startOfDay, addDays, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

// Validation schema for single date override
const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  isAvailable: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
})

// Validation schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
  isAvailable: z.boolean(),
})

// Helper function to get end of day
function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// GET /api/date-overrides - Get user's date overrides
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Build query filter
    const whereClause: any = { userId: auth.userId }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: parseISO(startDate),
        lte: parseISO(endDate),
      }
    } else if (startDate) {
      whereClause.date = { gte: parseISO(startDate) }
    }
    
    const dateOverrides = await prisma.dateOverride.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    })
    
    return NextResponse.json({ dateOverrides })
    
  } catch (error) {
    console.error('Get date overrides error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/date-overrides - Create date override(s)
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const body = await request.json()
    
    // Check if it's a date range or single date
    if (body.startDate && body.endDate) {
      // Date range blocking
      const validatedData = dateRangeSchema.parse(body)
      
      const startDate = parseISO(validatedData.startDate)
      const endDate = parseISO(validatedData.endDate)
      
      // Validate date range
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }
      
      // Validate not too far in the past
      const today = startOfDay(new Date())
      if (endDate < today) {
        return NextResponse.json(
          { error: 'Cannot set date overrides in the past' },
          { status: 400 }
        )
      }
      
      // Generate all dates in range
      const datesToBlock = []
      let currentDate = startOfDay(startDate)
      const finalDate = startOfDay(endDate)
      
      while (currentDate <= finalDate) {
        datesToBlock.push(new Date(currentDate))
        currentDate = addDays(currentDate, 1)
      }
      
      // Check for existing bookings in this range (optional warning)
      const existingBookings = await prisma.booking.findMany({
        where: {
          userId: auth.userId,
          status: 'confirmed',
          startTime: {
            gte: startOfDay(startDate),
            lte: addDays(endOfDay(endDate), 1),
          },
        },
        select: {
          id: true,
          startTime: true,
          attendeeName: true,
        },
      })
      
      // Delete existing overrides for these dates to avoid duplicates
      await prisma.dateOverride.deleteMany({
        where: {
          userId: auth.userId,
          date: {
            in: datesToBlock,
          },
        },
      })
      
      // Create new overrides for all dates in range
      const createdOverrides = await prisma.dateOverride.createMany({
        data: datesToBlock.map(date => ({
          userId: auth.userId,
          date,
          isAvailable: validatedData.isAvailable,
        })),
      })
      
      return NextResponse.json({
        message: `Successfully blocked ${datesToBlock.length} days`,
        count: createdOverrides.count,
        warningBookings: existingBookings.length > 0 ? existingBookings : undefined,
      })
      
    } else {
      // Single date blocking
      const validatedData = dateOverrideSchema.parse(body)
      
      const date = startOfDay(parseISO(validatedData.date))
      const today = startOfDay(new Date())
      
      // Validate not in the past
      if (date < today) {
        return NextResponse.json(
          { error: 'Cannot set date override in the past' },
          { status: 400 }
        )
      }
      
      // Check for existing bookings on this date
      const existingBookings = await prisma.booking.findMany({
        where: {
          userId: auth.userId,
          status: 'confirmed',
          startTime: {
            gte: date,
            lt: addDays(date, 1),
          },
        },
      })
      
      // Check if override already exists
      const existingOverride = await prisma.dateOverride.findFirst({
        where: {
          userId: auth.userId,
          date,
        },
      })
      
      let dateOverride
      
      if (existingOverride) {
        // Update existing
        dateOverride = await prisma.dateOverride.update({
          where: { id: existingOverride.id },
          data: {
            isAvailable: validatedData.isAvailable,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
          },
        })
      } else {
        // Create new
        dateOverride = await prisma.dateOverride.create({
          data: {
            userId: auth.userId,
            date,
            isAvailable: validatedData.isAvailable,
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
          },
        })
      }
      
      return NextResponse.json({
        dateOverride,
        warningBookings: existingBookings.length > 0 ? existingBookings : undefined,
      })
    }
    
  } catch (error: any) {
    console.error('Create date override error:', error)
    
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
