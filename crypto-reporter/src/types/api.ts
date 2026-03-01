import { Network } from './network'

export type DetectNetworkRequest = {
  address: string
}

export type DetectNetworkResponse = {
  network: Network
  valid: true
}

export type DetectNetworkError = {
  error: 'INVALID_FORMAT' | 'UNSUPPORTED_NETWORK'
  message: string
}

export type GenerateReportRequest = {
  address: string
  network: Network
  dateFrom: string   // YYYY-MM-DD
  dateTo: string     // YYYY-MM-DD
  apiKey?: string
}

export type GenerateReportResponse = {
  fileUrl: string
  fileName: string
  fileSize: string
  txCount: number
}

export type ValidateKeyRequest = {
  network: string
  apiKey: string
}

export type ValidateKeyResponse = {
  valid: boolean
  plan?: string
  message?: string
}
