import { Transaction } from '@/types/transaction'

const CSV_HEADERS = [
  'Date',
  'Tx Hash',
  'Direction',
  'From',
  'To',
  'Amount',
  'Token',
  'Network',
  'Fee',
  'Tx URL',
]

function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function generateCSV(transactions: Transaction[]): string {
  const rows: string[] = [CSV_HEADERS.join(',')]

  for (const tx of transactions) {
    const row = [
      tx.date,
      tx.txHash,
      tx.direction,
      tx.from,
      tx.to,
      tx.amount,
      tx.token,
      tx.network,
      tx.fee,
      tx.txUrl,
    ]
    rows.push(row.map(escapeCSV).join(','))
  }

  return rows.join('\n')
}
