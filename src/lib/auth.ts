import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const COOKIE_NAME = 'auth_token'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export type JwtPayload = {
  userId: number
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE_SECONDS })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function setAuthCookie(token: string): void {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  })
}

export function clearAuthCookie(): void {
  cookies().set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

export function getAuthToken(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value
}

export function getCurrentUser(): JwtPayload | null {
  const token = getAuthToken()
  if (!token) return null
  return verifyToken(token)
}
