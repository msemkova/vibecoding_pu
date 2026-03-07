import { Network } from './network'

export type GenerateReportRequest = {
  address: string
  network: Network
  dateFrom: string  // YYYY-MM-DD
  dateTo: string    // YYYY-MM-DD
  apiKey?: string   // Decrypted client-side before sending
}

export type GenerateReportResponse = {
  fileUrl: string
  fileName: string
  fileSize: string
  txCount: number
}

export type DetectNetworkRequest = {
  address: string
  apiKey?: string
}

export type DetectNetworkResponse = {
  network: Network
}

export type ValidateKeyRequest = {
  network: Network
  apiKey: string
}

export type ValidateKeyResponse = {
  valid: boolean
  error?: string
}

export type ApiError = {
  error: string
  details?: unknown
}
