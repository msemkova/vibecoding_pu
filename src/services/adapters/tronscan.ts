import { Transaction } from '@/types/transaction'
import { BlockchainAdapter, RawTransaction } from './types'

function formatTrx(sunAmount: number): string {
  const trx = sunAmount / 1_000_000
  return trx.toFixed(6).replace(/\.?0+$/, '') || '0'
}

export class TronScanAdapter implements BlockchainAdapter {
  network = 'tron' as const

  async fetchPage(
    address: string,
    cursor: string | null,
    apiKey?: string
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      address,
      limit: '50',
      start: cursor ?? '0',
    })

    const headers: Record<string, string> = {}
    if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey

    const res = await fetch(
      `https://apilist.tronscanapi.com/api/transaction?${params}`,
      { headers }
    )
    if (!res.ok) throw new Error(`TronScan HTTP ${res.status}`)

    const json = await res.json()
    return (json.data ?? []) as RawTransaction[]
  }

  normalize(raw: RawTransaction, address: string): Transaction {
    const timestamp = Number(raw.timestamp ?? 0)
    const contractData = raw.contractData as Record<string, unknown> | undefined
    const amount = Number(contractData?.amount ?? 0)
    const ownerAddress = (contractData?.owner_address as string) ?? ''
    const toAddress = (contractData?.to_address as string) ?? ''
    const txId = (raw.hash as string) ?? ''

    return {
      date: new Date(timestamp).toISOString(),
      txHash: txId,
      direction: toAddress === address ? 'IN' : 'OUT',
      from: ownerAddress,
      to: toAddress,
      // amount is always a decimal string — never a number
      amount: formatTrx(amount),
      token: 'TRX',
      network: this.network,
      fee: formatTrx(Number(raw.cost ?? 0)),
      txUrl: this.getTxUrl(txId),
    }
  }

  getNextCursor(page: RawTransaction[]): string | null {
    return page.length > 0 ? String(page.length) : null
  }

  getTxUrl(txHash: string): string {
    return `https://tronscan.org/#/transaction/${txHash}`
  }

  getRateLimitMs(): number {
    return 200
  }
}
