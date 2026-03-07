import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  // Validate id format to prevent path traversal
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
  }

  const csvPath = path.join('/tmp/reports', `${id}.csv`)
  const metaPath = path.join('/tmp/reports', `${id}.meta`)

  if (!fs.existsSync(csvPath)) {
    return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 })
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const fileName = fs.existsSync(metaPath)
    ? fs.readFileSync(metaPath, 'utf-8')
    : 'report.csv'

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
