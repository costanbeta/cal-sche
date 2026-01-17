import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-calendar'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// GET /api/calendar/callback - OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error || !code) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?calendar_error=${error || 'no_code'}`
      )
    }
    
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)
    
    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?calendar_error=no_tokens`
      )
    }
    
    // Get user from session (simplified - in production, use proper session management)
    // For now, we'll store the state with user ID in the OAuth flow
    const auth = await authMiddleware(request)
    if (!auth) {
      return NextResponse.redirect(`${process.env.APP_URL}/auth/login`)
    }
    
    // Store calendar connection
    const existing = await prisma.calendarConnection.findFirst({
      where: {
        userId: auth.userId,
        provider: 'google',
      },
    })

    if (existing) {
      await prisma.calendarConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token!,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })
    } else {
      await prisma.calendarConnection.create({
        data: {
          userId: auth.userId,
          provider: 'google',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token!,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isPrimary: true,
        },
      })
    }
    
    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?calendar_success=true`
    )
    
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?calendar_error=internal`
    )
  }
}
