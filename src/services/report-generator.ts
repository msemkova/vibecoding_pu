import { Network } from '@/types/network'
import { Transaction } from '@/types/transaction'
import { AdapterFactory } from './adapters/factory'

const RATE_LIMIT_MS: Record<Network, number> = {
  ethereum: 200,
  arbitrum: 200,
  bitcoin: 0,
  tron: 200,
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchTransactions(
  address: string,
  network: Network,
  dateFrom: Date,
  dateTo: Date,
  apiKey?: string
): Promise<Transaction[]> {
  const adapter = AdapterFactory.create(network)
  const allTx: Transaction[] = []
  let cursor: string | null = null
  const rateLimitMs = RATE_LIMIT_MS[network]

  while (true) {
    const page = await adapter.fetchPage(address, cursor, apiKey)
    if (page.length === 0) break

    const normalized = page.map((raw) => adapter.normalize(raw, address))

    for (const tx of normalized) {
      const txDate = new Date(tx.date)
      if (txDate >= dateFrom && txDate <= dateTo) {
        allTx.push(tx)
      }
    }

    // Early termination: oldest tx in page is before dateFrom
    const oldestTx = normalized[normalized.length - 1]
    if (oldestTx && new Date(oldestTx.date) < dateFrom) break

    cursor = adapter.getNextCursor(page)
    if (!cursor) break

    if (rateLimitMs > 0) await sleep(rateLimitMs)
  }

  // Sort by date descending
  allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return allTx
}
