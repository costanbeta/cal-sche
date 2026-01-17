import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    })
    
    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }
      if (existingUser.username === validatedData.username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        username: validatedData.username.toLowerCase(),
        password: hashedPassword,
        timezone: 'UTC', // Will be updated later
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        timezone: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json({
      message: 'User created successfully',
      user,
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Signup error:', error)
    
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
