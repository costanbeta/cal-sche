import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this'

export interface JWTPayload {
  userId: string
  email: string
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
  })
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Generate a random username from email
 */
export function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase()
  const randomSuffix = Math.floor(Math.random() * 10000)
  return `${baseUsername}${randomSuffix}`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate username format (alphanumeric, hyphen, underscore only)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
