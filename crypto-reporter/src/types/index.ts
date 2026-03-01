export type Network = 'ethereum' | 'arbitrum' | 'bitcoin' | 'tron'

export interface DetectedAddress {
  address: string
  network: Network
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  fee: string
  network: Network
  direction: 'in' | 'out'
}

export interface ReportRequest {
  address: string
  network: Network
  dateFrom: string
  dateTo: string
}

export interface ReportResult {
  ok: true
  csv: string
  txCount: number
}

export interface ErrorResult {
  ok: false
  error: string
}
