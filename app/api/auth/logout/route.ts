import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Logout successful',
  })
  
  // Clear the auth token cookie
  response.cookies.delete('auth-token')
  
  return response
}
