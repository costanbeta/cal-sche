import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendEmailVerification } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    const verificationToken = generateVerificationToken()
    const verificationTokenExpiry = new Date()
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    })

    try {
      await sendEmailVerification(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
      success: true,
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
