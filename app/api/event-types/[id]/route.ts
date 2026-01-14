import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { eventTypeSchema } from '@/lib/validations'

// GET /api/event-types/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const eventType = await prisma.eventType.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    })
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ eventType })
    
  } catch (error) {
    console.error('Get event type error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/event-types/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const body = await request.json()
    const validatedData = eventTypeSchema.partial().parse(body)
    
    // Check if event type exists and belongs to user
    const existingEventType = await prisma.eventType.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    })
    
    if (!existingEventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }
    
    // If updating slug, check for conflicts
    if (validatedData.slug && validatedData.slug !== existingEventType.slug) {
      const conflictingEventType = await prisma.eventType.findUnique({
        where: {
          userId_slug: {
            userId: auth.userId,
            slug: validatedData.slug,
          },
        },
      })
      
      if (conflictingEventType) {
        return NextResponse.json(
          { error: 'Event type with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    const eventType = await prisma.eventType.update({
      where: { id: params.id },
      data: validatedData,
    })
    
    return NextResponse.json({ eventType })
    
  } catch (error: any) {
    console.error('Update event type error:', error)
    
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

// DELETE /api/event-types/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    // Check if event type exists and belongs to user
    const eventType = await prisma.eventType.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    })
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }
    
    await prisma.eventType.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: 'Event type deleted' })
    
  } catch (error) {
    console.error('Delete event type error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
