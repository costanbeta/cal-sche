import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/users/[username]/events/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string; slug: string } }
) {
  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        name: true,
        username: true,
        timezone: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Find event type by slug
    const eventType = await prisma.eventType.findUnique({
      where: {
        userId_slug: {
          userId: user.id,
          slug: params.slug,
        },
      },
    })
    
    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { error: 'Event type not found or inactive' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      eventType: {
        ...eventType,
        user,
      },
    })
    
  } catch (error) {
    console.error('Get event type error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
