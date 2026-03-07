import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { detectNetwork } from '@/services/network-detection'

const detectNetworkSchema = z.object({
  address: z.string().min(1),
  apiKey: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = detectNetworkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.issues },
      { status: 400 }
    )
  }

  try {
    const network = await detectNetwork(parsed.data.address, parsed.data.apiKey)
    return NextResponse.json({ network })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
