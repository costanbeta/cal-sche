import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// POST /api/calendar/disconnect - Remove calendar connection
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    await prisma.calendarConnection.deleteMany({
      where: { userId: auth.userId },
    })
    
    return NextResponse.json({ message: 'Calendar disconnected successfully' })
    
  } catch (error) {
    console.error('Calendar disconnect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
