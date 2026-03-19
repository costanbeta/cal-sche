import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const [zoomIntegration, googleConnection] = await Promise.all([
      prisma.integration.findUnique({
        where: { userId_provider: { userId: auth.userId, provider: 'zoom' } },
        select: { id: true, email: true, createdAt: true },
      }),
      prisma.calendarConnection.findFirst({
        where: { userId: auth.userId, provider: 'google' },
        select: { id: true, createdAt: true },
      }),
    ])

    return NextResponse.json({
      zoom: {
        connected: !!zoomIntegration,
        email: zoomIntegration?.email || null,
      },
      google_meet: {
        connected: !!googleConnection,
      },
    })
  } catch (error) {
    console.error('Integration status error:', error)
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    )
  }
}
