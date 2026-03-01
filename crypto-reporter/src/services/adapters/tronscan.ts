import { z } from 'zod'
import type { Transaction } from '@/types'
import type { BlockchainAdapter, FetchParams } from './base'

// ---------------------------------------------------------------------------
// Tronscan public API — no API key required for basic endpoints
// Docs: https://github.com/tronscan/tronscan-frontend/blob/master/document/api.md
// ---------------------------------------------------------------------------

const BASE_URL = 'https://apilist.tronscanapi.com/api'
const PAGE_SIZE = 50

// ---- Zod schemas for API responses ----------------------------------------

const TrxTransactionSchema = z.object({
  hash: z.string(),
  ownerAddress: z.string(),
  toAddress: z.string(),
  amount: z.number(),           // sun (1 TRX = 1_000_000 sun)
  timestamp: z.number(),        // ms
  cost: z.object({ fee: z.number().optional() }).optional(),
  confirmed: z.boolean().optional(),
})

const TrxResponseSchema = z.object({
  data: z.array(TrxTransactionSchema),
  total: z.number().optional(),
  rangeTotal: z.number().optional(),
})

const Trc20TransferSchema = z.object({
  transaction_id: z.string(),
  from_address: z.string(),
  to_address: z.string(),
  quant: z.string(),            // raw token amount as string
  block_ts: z.number(),         // ms
  tokenInfo: z.object({
    tokenAbbr: z.string(),
    tokenDecimal: z.number(),
  }).optional(),
})

const Trc20ResponseSchema = z.object({
  token_transfers: z.array(Trc20TransferSchema),
  total: z.number().optional(),
  rangeTotal: z.number().optional(),
})

// ---------------------------------------------------------------------------

function sunToTrx(sun: number): string {
  return (sun / 1_000_000).toFixed(6)
}

function rawToDecimal(raw: string, decimals: number): string {
  const n = BigInt(raw)
  const divisor = BigInt(10 ** decimals)
  const whole = n / divisor
  const remainder = n % divisor
  const fracStr = remainder.toString().padStart(decimals, '0').slice(0, 6)
  return `${whole}.${fracStr}`
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Tronscan HTTP ${res.status} for ${url}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------

export class TronscanAdapter implements BlockchainAdapter {
  name = 'Tronscan'

  async fetchTransactions(params: FetchParams): Promise<Transaction[]> {
    const { address, dateFrom, dateTo } = params
    const start = dateFrom.getTime()
    const end = dateTo.getTime()

    const [trxTxs, trc20Txs] = await Promise.all([
      this.#fetchTrxTransactions(address, start, end),
      this.#fetchTrc20Transfers(address, start, end),
    ])

    return [...trxTxs, ...trc20Txs].sort((a, b) => a.timestamp - b.timestamp)
  }

  async #fetchTrxTransactions(
    address: string,
    start: number,
    end: number,
  ): Promise<Transaction[]> {
    const results: Transaction[] = []
    let offset = 0

    while (true) {
      const url =
        `${BASE_URL}/transaction` +
        `?address=${address}` +
        `&start_timestamp=${start}` +
        `&end_timestamp=${end}` +
        `&limit=${PAGE_SIZE}` +
        `&start=${offset}` +
        `&sort=-timestamp`

      const raw = await fetchJson(url)
      const parsed = TrxResponseSchema.parse(raw)

      for (const tx of parsed.data) {
        const isIncoming = tx.toAddress.toLowerCase() === address.toLowerCase()
        results.push({
          hash: tx.hash,
          from: tx.ownerAddress,
          to: tx.toAddress,
          value: sunToTrx(tx.amount) + ' TRX',
          timestamp: tx.timestamp,
          fee: sunToTrx(tx.cost?.fee ?? 0) + ' TRX',
          network: 'tron',
          direction: isIncoming ? 'in' : 'out',
        })
      }

      const total = parsed.rangeTotal ?? parsed.total ?? 0
      offset += parsed.data.length
      if (parsed.data.length === 0 || offset >= total) break
    }

    return results
  }

  async #fetchTrc20Transfers(
    address: string,
    start: number,
    end: number,
  ): Promise<Transaction[]> {
    const results: Transaction[] = []
    let offset = 0

    while (true) {
      const url =
        `${BASE_URL}/token_trc20/transfers` +
        `?relatedAddress=${address}` +
        `&start_timestamp=${start}` +
        `&end_timestamp=${end}` +
        `&limit=${PAGE_SIZE}` +
        `&start=${offset}` +
        `&sort=-timestamp`

      const raw = await fetchJson(url)
      const parsed = Trc20ResponseSchema.parse(raw)

      for (const tx of parsed.token_transfers) {
        const info = tx.tokenInfo
        const decimals = info?.tokenDecimal ?? 6
        const symbol = info?.tokenAbbr ?? 'TRC20'
        const amount = rawToDecimal(tx.quant, decimals)
        const isIncoming = tx.to_address.toLowerCase() === address.toLowerCase()

        results.push({
          hash: tx.transaction_id,
          from: tx.from_address,
          to: tx.to_address,
          value: `${amount} ${symbol}`,
          timestamp: tx.block_ts,
          fee: '0 TRX',           // TRC-20 fee is paid in TRX by the sender; not returned here
          network: 'tron',
          direction: isIncoming ? 'in' : 'out',
        })
      }

      const total = parsed.rangeTotal ?? parsed.total ?? 0
      offset += parsed.token_transfers.length
      if (parsed.token_transfers.length === 0 || offset >= total) break
    }

    return results
  }
}
