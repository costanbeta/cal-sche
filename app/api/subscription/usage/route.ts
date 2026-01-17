import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { getUsageMetrics } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req)
    if (!auth) return unauthorizedResponse()

    const usage = await getUsageMetrics(auth.userId)

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Failed to fetch usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
