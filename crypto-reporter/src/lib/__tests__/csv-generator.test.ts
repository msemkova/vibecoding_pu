import { describe, it, expect } from 'vitest'
import { generateCsv } from '../csv-generator'
import type { Transaction } from '@/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TX_IN: Transaction = {
  hash: 'abc123',
  from: 'TSenderAddress111111111111111111111',
  to: 'TReceiverAddr22222222222222222222222',
  value: '5.000000 TRX',
  timestamp: new Date('2024-01-10T12:00:00Z').getTime(),
  fee: '0.100000 TRX',
  network: 'tron',
  direction: 'in',
}

const TX_OUT: Transaction = {
  hash: 'def456',
  from: 'TReceiverAddr22222222222222222222222',
  to: 'TSenderAddress111111111111111111111',
  value: '10.000000 USDT',
  timestamp: new Date('2024-01-15T08:30:00Z').getTime(),
  fee: '0 TRX',
  network: 'tron',
  direction: 'out',
}

const HEADERS = 'Date (UTC),Hash,Direction,From,To,Value,Fee,Network'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateCsv', () => {
  it('returns only headers for empty transactions list', () => {
    expect(generateCsv([])).toBe(HEADERS)
  })

  it('produces correct column headers', () => {
    const csv = generateCsv([])
    expect(csv.split('\r\n')[0]).toBe(HEADERS)
  })

  it('uses CRLF line endings (RFC 4180)', () => {
    const csv = generateCsv([TX_IN])
    expect(csv).toContain('\r\n')
    expect(csv.split('\r\n')).toHaveLength(2)
  })

  it('maps transaction fields to correct columns', () => {
    const csv = generateCsv([TX_IN])
    const row = csv.split('\r\n')[1]
    expect(row).toContain('2024-01-10 12:00:00 UTC')
    expect(row).toContain('abc123')
    expect(row).toContain('in')
    expect(row).toContain('TSenderAddress111111111111111111111')
    expect(row).toContain('TReceiverAddr22222222222222222222222')
    expect(row).toContain('5.000000 TRX')
    expect(row).toContain('0.100000 TRX')
    expect(row).toContain('tron')
  })

  it('generates one data row per transaction', () => {
    const csv = generateCsv([TX_IN, TX_OUT])
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('preserves transaction order', () => {
    const csv = generateCsv([TX_IN, TX_OUT])
    const [, row1, row2] = csv.split('\r\n')
    expect(row1).toContain('abc123')
    expect(row2).toContain('def456')
  })

  // ---- RFC 4180 escaping ---------------------------------------------------

  it('wraps cell in double-quotes when it contains a comma', () => {
    const tx: Transaction = { ...TX_IN, value: '1,000 TRX' }
    const csv = generateCsv([tx])
    expect(csv).toContain('"1,000 TRX"')
  })

  it('escapes double-quotes inside a cell by doubling them', () => {
    const tx: Transaction = { ...TX_IN, hash: 'say "hello"' }
    const csv = generateCsv([tx])
    expect(csv).toContain('"say ""hello"""')
  })

  it('wraps cell in double-quotes when it contains a newline', () => {
    const tx: Transaction = { ...TX_IN, hash: 'line1\nline2' }
    const csv = generateCsv([tx])
    expect(csv).toContain('"line1\nline2"')
  })

  it('wraps cell in double-quotes when it contains CRLF', () => {
    const tx: Transaction = { ...TX_IN, hash: 'line1\r\nline2' }
    const csv = generateCsv([tx])
    expect(csv).toContain('"line1\r\nline2"')
  })

  it('does not add unnecessary quotes to plain values', () => {
    const csv = generateCsv([TX_IN])
    const row = csv.split('\r\n')[1]
    expect(row).not.toContain('"abc123"')   // hash has no special chars
  })

  // ---- BOM option ----------------------------------------------------------

  it('does not add BOM by default', () => {
    const csv = generateCsv([TX_IN])
    expect(csv.charCodeAt(0)).not.toBe(0xfeff)
  })

  it('adds UTF-8 BOM when bom option is true', () => {
    const csv = generateCsv([TX_IN], { bom: true })
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    // content after BOM is still valid CSV
    expect(csv.slice(1).startsWith(HEADERS)).toBe(true)
  })

  // ---- Timestamp formatting ------------------------------------------------

  it('formats timestamp as ISO-like UTC string', () => {
    const csv = generateCsv([TX_OUT])
    expect(csv).toContain('2024-01-15 08:30:00 UTC')
  })
})
