import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// DELETE /api/date-overrides/[id] - Delete a date override
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const { id } = params
    
    // Check if override exists and belongs to user
    const dateOverride = await prisma.dateOverride.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    })
    
    if (!dateOverride) {
      return NextResponse.json(
        { error: 'Date override not found' },
        { status: 404 }
      )
    }
    
    // Delete the override
    await prisma.dateOverride.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Date override deleted successfully' })
    
  } catch (error) {
    console.error('Delete date override error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/date-overrides/[id] - Update a date override
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()
    
    const { id } = params
    const body = await request.json()
    
    // Check if override exists and belongs to user
    const existingOverride = await prisma.dateOverride.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    })
    
    if (!existingOverride) {
      return NextResponse.json(
        { error: 'Date override not found' },
        { status: 404 }
      )
    }
    
    // Update the override
    const dateOverride = await prisma.dateOverride.update({
      where: { id },
      data: {
        isAvailable: body.isAvailable ?? existingOverride.isAvailable,
        startTime: body.startTime ?? existingOverride.startTime,
        endTime: body.endTime ?? existingOverride.endTime,
      },
    })
    
    return NextResponse.json({ dateOverride })
    
  } catch (error) {
    console.error('Update date override error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
