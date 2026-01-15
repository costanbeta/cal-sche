import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[username]
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // Find user by username with their active event types
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        name: true,
        username: true,
        timezone: true,
        eventTypes: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            duration: true,
            color: true,
            location: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      name: user.name,
      username: user.username,
      timezone: user.timezone,
      eventTypes: user.eventTypes,
    })
    
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
