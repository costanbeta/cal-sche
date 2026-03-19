import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { createZoomMeeting, getValidZoomToken } from '@/lib/zoom'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const { topic, duration, startTime, agenda } = await request.json()

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: auth.userId, provider: 'zoom' } },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Zoom not connected. Please connect your Zoom account first.' },
        { status: 400 }
      )
    }

    const validToken = await getValidZoomToken(
      integration.accessToken,
      integration.refreshToken,
      integration.expiresAt
    )

    if (validToken.refreshToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          accessToken: validToken.accessToken,
          refreshToken: validToken.refreshToken,
          expiresAt: validToken.expiresAt,
        },
      })
    }

    const meeting = await createZoomMeeting(validToken.accessToken, {
      topic: topic || 'Meeting',
      duration: duration || 30,
      startTime,
      agenda,
    })

    return NextResponse.json({
      meetingLink: meeting.joinUrl,
      meetingId: meeting.meetingId,
      password: meeting.password,
    })
  } catch (error: any) {
    console.error('Create Zoom meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Zoom meeting' },
      { status: 500 }
    )
  }
}
