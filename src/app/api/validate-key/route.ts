import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const validateKeySchema = z.object({
  network: z.enum(['ethereum', 'arbitrum', 'tron']),
  apiKey: z.string().min(1),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = validateKeySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { network, apiKey } = parsed.data

  try {
    if (network === 'ethereum' || network === 'arbitrum') {
      const chainId = network === 'ethereum' ? 1 : 42161
      const params = new URLSearchParams({
        chainid: String(chainId),
        module: 'account',
        action: 'txlist',
        address: '0x0000000000000000000000000000000000000000',
        page: '1',
        offset: '1',
        apikey: apiKey,
      })
      const res = await fetch(`https://api.etherscan.io/v2/api?${params}`)
      const json = await res.json()
      // Invalid key returns status 0 with NOTOK message
      const valid = json.message !== 'NOTOK' && json.status !== '0' || json.message === 'No transactions found'
      return NextResponse.json({ valid })
    }

    if (network === 'tron') {
      const res = await fetch(
        'https://apilist.tronscanapi.com/api/transaction?limit=1',
        { headers: { 'TRON-PRO-API-KEY': apiKey } }
      )
      return NextResponse.json({ valid: res.ok })
    }

    return NextResponse.json({ valid: false, error: 'Unsupported network' })
  } catch {
    return NextResponse.json({ valid: false, error: 'Validation failed' })
  }
}
