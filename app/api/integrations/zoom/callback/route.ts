import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getZoomTokens, getZoomUserInfo } from '@/lib/zoom'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/event-types/new?error=zoom_missing_params', request.url)
      )
    }

    let userId: string
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
      userId = decoded.userId
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/event-types/new?error=zoom_invalid_state', request.url)
      )
    }

    const tokens = await getZoomTokens(code)
    const userInfo = await getZoomUserInfo(tokens.access_token)

    await prisma.integration.upsert({
      where: {
        userId_provider: { userId, provider: 'zoom' },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        email: userInfo.email,
      },
      create: {
        userId,
        provider: 'zoom',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        email: userInfo.email,
      },
    })

    return NextResponse.redirect(
      new URL('/dashboard/event-types/new?zoom=connected', request.url)
    )
  } catch (error) {
    console.error('Zoom callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/event-types/new?error=zoom_callback_failed', request.url)
    )
  }
}
