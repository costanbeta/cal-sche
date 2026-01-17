import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { getUserSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req)
    if (!auth) return unauthorizedResponse()

    const subscription = await getUserSubscription(auth.userId)

    if (!subscription) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
