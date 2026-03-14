import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userRepo } from '@/lib/db'
import { generatePassword, hashPassword } from '@/lib/password'
import { sendPasswordEmail } from '@/lib/email'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Некорректный email' },
      { status: 400 }
    )
  }

  const { email } = parsed.data

  // Return same response whether email exists or not (security)
  const existing = userRepo.findByEmail(email)

  const password = generatePassword()
  const hashed = await hashPassword(password)

  if (existing) {
    // Update password and resend (user re-registered)
    userRepo.updatePassword(email, hashed)
  } else {
    userRepo.create(email, hashed)
  }

  try {
    await sendPasswordEmail(email, password)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
