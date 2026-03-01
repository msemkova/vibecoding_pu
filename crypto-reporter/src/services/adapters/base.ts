import type { Transaction } from '@/types'

export interface FetchParams {
  address: string
  dateFrom: Date
  dateTo: Date
}

export interface BlockchainAdapter {
  /** Human-readable name of the explorer */
  name: string
  /** Fetch all transactions (native + tokens) in the given date range */
  fetchTransactions(params: FetchParams): Promise<Transaction[]>
}
