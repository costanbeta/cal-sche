import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// GET /api/calendar/connect - Initiate OAuth flow
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    // Check if Google OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.' },
        { status: 503 }
      )
    }
    
    const authUrl = getAuthUrl()
    
    // Return JSON with auth URL for the frontend to redirect
    return NextResponse.json({ authUrl })
    
  } catch (error) {
    console.error('Calendar connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google Calendar connection. Please try again.' },
      { status: 500 }
    )
  }
}
