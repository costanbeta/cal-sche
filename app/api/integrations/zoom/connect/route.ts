import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { getZoomAuthUrl } from '@/lib/zoom'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (!auth) return unauthorizedResponse()

  const state = Buffer.from(JSON.stringify({ userId: auth.userId })).toString('base64')
  const authUrl = getZoomAuthUrl(state)

  return NextResponse.redirect(authUrl)
}
