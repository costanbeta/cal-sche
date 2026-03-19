import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { checkEventTypeLimit } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const usage = await checkEventTypeLimit(auth.userId)

    return NextResponse.json({
      current: usage.current,
      limit: usage.limit,
      remaining: usage.limit - usage.current,
      allowed: usage.allowed,
    })
  } catch (error) {
    console.error('Event type usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
