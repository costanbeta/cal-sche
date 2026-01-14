import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  return payload
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
