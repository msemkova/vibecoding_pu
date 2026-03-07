import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateCSV } from '@/lib/csv-generator'
import { fetchTransactions } from '@/services/report-generator'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const generateReportSchema = z.object({
  address: z.string().min(1),
  network: z.enum(['ethereum', 'bitcoin', 'tron', 'arbitrum']),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  apiKey: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = generateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { address, network, dateFrom, dateTo, apiKey } = parsed.data
  const from = new Date(`${dateFrom}T00:00:00Z`)
  const to = new Date(`${dateTo}T23:59:59Z`)

  if (from > to) {
    return NextResponse.json(
      { error: 'dateFrom must be before dateTo' },
      { status: 400 }
    )
  }

  try {
    const transactions = await fetchTransactions(address, network, from, to, apiKey)
    const csv = generateCSV(transactions)

    // Save to tmp
    const tmpDir = '/tmp/reports'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const id = randomUUID()
    const shortAddr = address.slice(0, 6)
    const fileName = `report_${shortAddr}_${dateFrom}_${dateTo}.csv`
    fs.writeFileSync(path.join(tmpDir, `${id}.csv`), csv, 'utf-8')
    fs.writeFileSync(path.join(tmpDir, `${id}.meta`), fileName, 'utf-8')

    const fileSizeBytes = Buffer.byteLength(csv, 'utf-8')
    const fileSize =
      fileSizeBytes < 1024
        ? `${fileSizeBytes}B`
        : fileSizeBytes < 1024 * 1024
          ? `${(fileSizeBytes / 1024).toFixed(1)}KB`
          : `${(fileSizeBytes / (1024 * 1024)).toFixed(2)}MB`

    return NextResponse.json({
      fileUrl: `/api/download/${id}`,
      fileName,
      fileSize,
      txCount: transactions.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
