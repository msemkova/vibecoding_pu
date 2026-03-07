import { Transaction } from '@/types/transaction'
import { BlockchainAdapter, RawTransaction } from './types'

function satoshiToBtc(satoshi: number): string {
  const btc = satoshi / 100_000_000
  return btc.toFixed(8).replace(/\.?0+$/, '') || '0'
}

type VIn = { prevout?: { scriptpubkey_address?: string; value?: number } }
type VOut = { scriptpubkey_address?: string; value?: number }
type BlockstreamTx = {
  txid: string
  status: { block_time?: number }
  vin: VIn[]
  vout: VOut[]
  fee: number
}

export class BlockstreamAdapter implements BlockchainAdapter {
  network = 'bitcoin' as const
  private lastSeenTxid: string | null = null

  async fetchPage(
    address: string,
    cursor: string | null,
    _apiKey?: string
  ): Promise<RawTransaction[]> {
    let url = `https://blockstream.info/api/address/${address}/txs`
    if (cursor) url += `/chain/${cursor}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Blockstream HTTP ${res.status}`)
    const txs = await res.json()
    if (txs.length > 0) {
      this.lastSeenTxid = txs[txs.length - 1].txid
    }
    return txs as RawTransaction[]
  }

  normalize(raw: RawTransaction, address: string): Transaction {
    const tx = raw as unknown as BlockstreamTx
    const blockTime = tx.status.block_time ?? 0

    let received = 0
    let sent = 0
    for (const vout of tx.vout) {
      if (vout.scriptpubkey_address === address) received += vout.value ?? 0
    }
    for (const vin of tx.vin) {
      if (vin.prevout?.scriptpubkey_address === address) sent += vin.prevout.value ?? 0
    }

    const direction = received > sent ? 'IN' : 'OUT'
    const amount = direction === 'IN' ? received - sent : sent - received

    return {
      date: new Date(blockTime * 1000).toISOString(),
      txHash: tx.txid,
      direction,
      from: tx.vin[0]?.prevout?.scriptpubkey_address ?? '',
      to: tx.vout[0]?.scriptpubkey_address ?? '',
      // amount is always a decimal string — never a number
      amount: satoshiToBtc(amount),
      token: 'BTC',
      network: this.network,
      fee: satoshiToBtc(tx.fee),
      txUrl: this.getTxUrl(tx.txid),
    }
  }

  getNextCursor(_page: RawTransaction[]): string | null {
    return this.lastSeenTxid
  }

  getTxUrl(txHash: string): string {
    return `https://mempool.space/tx/${txHash}`
  }

  getRateLimitMs(): number {
    return 0
  }
}
