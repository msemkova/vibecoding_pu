import { Network } from '@/types/network'
import { Transaction } from '@/types/transaction'

export type RawTransaction = Record<string, unknown>

export interface BlockchainAdapter {
  network: Network
  fetchPage(
    address: string,
    cursor: string | null,
    apiKey?: string
  ): Promise<RawTransaction[]>
  normalize(raw: RawTransaction, address: string): Transaction
  getNextCursor(page: RawTransaction[]): string | null
  getTxUrl(txHash: string): string
  getRateLimitMs(): number
}
