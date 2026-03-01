export type Transaction = {
  date: string        // ISO 8601 UTC
  txHash: string
  direction: 'IN' | 'OUT'
  from: string
  to: string
  amount: string      // Decimal string
  token: string       // Symbol (ETH, BTC, TRX)
  network: string
  fee: string         // Native currency fee
  txUrl: string
}

export type ReportRequest = {
  address: string
  network: string
  dateFrom: Date
  dateTo: Date
  apiKey?: string
}

export type EncryptedSecret = {
  id: string
  encryptedData: ArrayBuffer
  salt: Uint8Array
  iv: Uint8Array
}
