import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUseBranding, validateBrandColor } from '@/lib/branding'

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.get('auth-token')?.value ||
                  req.headers.get('Authorization')?.replace('Bearer ', '')
    
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

    const userData = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        subscriptionTier: true,
        brandLogoUrl: true,
        brandColor: true,
        brandName: true,
        hidePoweredBy: true,
        customFooterText: true,
      },
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      branding: {
        brandLogoUrl: userData.brandLogoUrl,
        brandColor: userData.brandColor || '#2563EB',
        brandName: userData.brandName,
        hidePoweredBy: userData.hidePoweredBy,
        customFooterText: userData.customFooterText,
      },
      canUseBranding: canUseBranding(userData.subscriptionTier || undefined),
    })
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.get('auth-token')?.value ||
                  req.headers.get('Authorization')?.replace('Bearer ', '')
    
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

    const userData = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { subscriptionTier: true },
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has access to branding features
    if (!canUseBranding(userData.subscriptionTier || undefined)) {
      return NextResponse.json(
        { error: 'Custom branding requires Pro or Business plan' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { brandLogoUrl, brandColor, brandName, hidePoweredBy, customFooterText } = body

    // Validate brand color
    if (brandColor && !validateBrandColor(brandColor)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex format like #2563EB' },
        { status: 400 }
      )
    }

    // Validate logo URL
    if (brandLogoUrl) {
      try {
        new URL(brandLogoUrl)
      } catch {
        return NextResponse.json(
          { error: 'Invalid logo URL' },
          { status: 400 }
        )
      }
    }

    // Business plan check for hidePoweredBy
    if (hidePoweredBy && userData.subscriptionTier !== 'business') {
      return NextResponse.json(
        { error: 'Hiding "Powered by" requires Business plan' },
        { status: 403 }
      )
    }

    // Update branding settings
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        brandLogoUrl: brandLogoUrl || null,
        brandColor: brandColor || '#2563EB',
        brandName: brandName || null,
        hidePoweredBy: hidePoweredBy || false,
        customFooterText: customFooterText || null,
      },
      select: {
        brandLogoUrl: true,
        brandColor: true,
        brandName: true,
        hidePoweredBy: true,
        customFooterText: true,
      },
    })

    return NextResponse.json({
      message: 'Branding settings updated successfully',
      branding: updatedUser,
    })
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json(
      { error: 'Failed to update branding settings' },
      { status: 500 }
    )
  }
}
