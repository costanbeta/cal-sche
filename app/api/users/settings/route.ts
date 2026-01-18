import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
})

// PATCH /api/users/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)
    
    // Update user
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        timezone: true,
      },
    })
    
    return NextResponse.json({ user })
    
  } catch (error: any) {
    console.error('Update settings error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
