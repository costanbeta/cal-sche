import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'

// GET /api/calendar/connect - Initiate OAuth flow
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const authUrl = getAuthUrl()
    
    return NextResponse.redirect(authUrl)
    
  } catch (error) {
    console.error('Calendar connect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
