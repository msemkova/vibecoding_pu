import { NextRequest, NextResponse } from 'next/server'
import { detectNetwork } from '@/services/network-detection'
import { TronscanAdapter } from '@/services/adapters/tronscan'
import { generateCsv } from '@/lib/csv-generator'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { address, dateFrom, dateTo } = body as Record<string, unknown>

  if (typeof address !== 'string' || typeof dateFrom !== 'string' || typeof dateTo !== 'string') {
    return NextResponse.json({ error: 'address, dateFrom, dateTo are required strings' }, { status: 400 })
  }

  const detection = detectNetwork(address)
  if (!detection.ok) {
    return NextResponse.json({ error: detection.error }, { status: 400 })
  }
  if (detection.detected.network !== 'tron') {
    return NextResponse.json({ error: 'Only Tron addresses are supported in MVP' }, { status: 400 })
  }

  const from = new Date(dateFrom + 'T00:00:00Z')
  const to = new Date(dateTo + 'T23:59:59Z')

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date format, expected YYYY-MM-DD' }, { status: 400 })
  }
  if (from > to) {
    return NextResponse.json({ error: '"From" date must be before "To" date' }, { status: 400 })
  }

  try {
    const adapter = new TronscanAdapter()
    const txs = await adapter.fetchTransactions({
      address: detection.detected.address,
      dateFrom: from,
      dateTo: to,
    })

    const csv = generateCsv(txs, { bom: true })
    const filename = `tron-${detection.detected.address.slice(0, 10)}-${dateFrom}-${dateTo}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Tx-Count': String(txs.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
