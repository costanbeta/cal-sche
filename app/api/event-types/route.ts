import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { eventTypeSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/auth'
import { checkUsageLimit } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

// GET /api/event-types - List user's event types
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ eventTypes })
    
  } catch (error) {
    console.error('Get event types error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/event-types - Create event type
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    // Check usage limits
    const usageCheck = await checkUsageLimit(auth.userId, 'eventTypes')
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Event type limit reached',
          message: `You've reached your limit of ${usageCheck.limit} event types. Upgrade to Pro for unlimited event types.`,
          current: usageCheck.current,
          limit: usageCheck.limit,
          tier: usageCheck.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = eventTypeSchema.parse(body)
    
    // Check if slug already exists for this user
    const existingEventType = await prisma.eventType.findUnique({
      where: {
        userId_slug: {
          userId: auth.userId,
          slug: validatedData.slug,
        },
      },
    })
    
    if (existingEventType) {
      return NextResponse.json(
        { error: 'Event type with this slug already exists' },
        { status: 400 }
      )
    }
    
    const eventType = await prisma.eventType.create({
      data: {
        ...validatedData,
        userId: auth.userId,
      },
    })
    
    return NextResponse.json({ eventType }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create event type error:', error)
    
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
