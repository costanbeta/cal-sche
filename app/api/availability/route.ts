import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { availabilitySchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

// GET /api/availability - Get user's availability rules
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const availability = await prisma.availability.findMany({
      where: { userId: auth.userId },
      orderBy: { dayOfWeek: 'asc' },
    })
    
    return NextResponse.json({ availability })
    
  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/availability - Set availability rules
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const body = await request.json()
    
    // Expecting an array of availability rules
    if (!Array.isArray(body.availability)) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      )
    }
    
    // Validate all rules
    const validatedRules = body.availability.map((rule: any) => 
      availabilitySchema.parse(rule)
    )
    
    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { userId: auth.userId },
    })
    
    // Create new availability rules
    const availability = await prisma.availability.createMany({
      data: validatedRules.map((rule: { dayOfWeek: number; startTime: string; endTime: string; timezone: string }) => ({
        ...rule,
        userId: auth.userId,
      })),
    })
    
    // Fetch created rules
    const createdRules = await prisma.availability.findMany({
      where: { userId: auth.userId },
      orderBy: { dayOfWeek: 'asc' },
    })
    
    return NextResponse.json({ availability: createdRules })
    
  } catch (error: any) {
    console.error('Set availability error:', error)
    
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
