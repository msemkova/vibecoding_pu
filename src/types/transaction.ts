export type Transaction = {
  date: string        // ISO 8601 UTC
  txHash: string      // Transaction hash
  direction: 'IN' | 'OUT'
  from: string        // Sender address
  to: string          // Receiver address
  amount: string      // Decimal string, base token unit (e.g. "1.234567")
  token: string       // Symbol (ETH, BTC, TRX, etc.)
  network: string     // ethereum, bitcoin, tron, arbitrum
  fee: string         // Native currency fee as decimal string
  txUrl: string       // Link to block explorer
}
