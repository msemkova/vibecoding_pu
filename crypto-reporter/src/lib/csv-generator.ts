import type { Transaction } from '@/types'

// ---------------------------------------------------------------------------
// CSV column definitions
// ---------------------------------------------------------------------------

const HEADERS = [
  'Date (UTC)',
  'Hash',
  'Direction',
  'From',
  'To',
  'Value',
  'Fee',
  'Network',
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape a single CSV cell value per RFC 4180. */
function escapeCell(value: string): string {
  // Wrap in double-quotes if the value contains a comma, double-quote, or newline
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
}

function txToRow(tx: Transaction): string {
  const cells = [
    formatTimestamp(tx.timestamp),
    tx.hash,
    tx.direction,
    tx.from,
    tx.to,
    tx.value,
    tx.fee,
    tx.network,
  ]
  return cells.map(escapeCell).join(',')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GenerateCsvOptions {
  /** BOM prefix for Excel compatibility (default: false) */
  bom?: boolean
}

/**
 * Generate a CSV string from a list of transactions.
 * Returns an empty string (headers only) when `transactions` is empty.
 */
export function generateCsv(
  transactions: Transaction[],
  options: GenerateCsvOptions = {},
): string {
  const lines: string[] = [HEADERS.join(',')]
  for (const tx of transactions) {
    lines.push(txToRow(tx))
  }
  const csv = lines.join('\r\n')
  return options.bom ? '\uFEFF' + csv : csv
}
