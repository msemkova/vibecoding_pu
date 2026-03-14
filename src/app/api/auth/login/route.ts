import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userRepo } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signToken, setAuthCookie } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  const { email, password } = parsed.data
  const user = userRepo.findByEmail(email)

  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 }
    )
  }

  const token = signToken({ userId: user.id, email: user.email })
  setAuthCookie(token)

  return NextResponse.json({ ok: true })
}
