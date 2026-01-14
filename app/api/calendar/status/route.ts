import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'

// GET /api/calendar/status - Check if user has calendar connected
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const calendarConnection = await prisma.calendarConnection.findFirst({
      where: {
        userId: auth.userId,
        provider: 'google',
      },
    })

    if (calendarConnection) {
      return NextResponse.json({
        connected: true,
        connection: {
          id: calendarConnection.id,
          provider: calendarConnection.provider,
          createdAt: calendarConnection.createdAt,
        },
      })
    }

    return NextResponse.json({ connected: false })
  } catch (error) {
    console.error('Check calendar status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
