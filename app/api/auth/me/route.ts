import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify token
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        timezone: true,
        avatarUrl: true,
        createdAt: true,
        // Subscription fields
        subscriptionTier: true,
        subscriptionStatus: true,
        razorpaySubscriptionId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        // Branding fields
        brandLogoUrl: true,
        brandColor: true,
        brandName: true,
        hidePoweredBy: true,
        customFooterText: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Format response with branding settings
    return NextResponse.json({
      user: {
        ...user,
        branding: {
          brandLogoUrl: user.brandLogoUrl,
          brandColor: user.brandColor || '#2563EB',
          brandName: user.brandName,
          hidePoweredBy: user.hidePoweredBy,
          customFooterText: user.customFooterText,
        },
      },
    })
    
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
