import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { detectNetwork } from '@/services/network-detection'

const RequestSchema = z.object({
  address: z.string().min(1),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_FORMAT', message: 'Неверный формат адреса' },
      { status: 400 }
    )
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_FORMAT', message: 'Неверный формат адреса' },
      { status: 400 }
    )
  }

  const result = await detectNetwork(parsed.data.address)

  if ('error' in result) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
