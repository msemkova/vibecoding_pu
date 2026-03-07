import { Network } from '@/types/network'
import { Transaction } from '@/types/transaction'
import { BlockchainAdapter, RawTransaction } from './types'

function formatUnits(value: string, decimals: number): string {
  const bigVal = BigInt(value)
  const divisor = BigInt(10 ** decimals)
  const intPart = bigVal / divisor
  const remainder = bigVal % divisor
  if (remainder === 0n) return intPart.toString()
  const remainderStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${intPart}.${remainderStr}`
}

export class EtherscanV2Adapter implements BlockchainAdapter {
  network: Network
  private chainId: number
  private tokenSymbol: string

  constructor(network: 'ethereum' | 'arbitrum') {
    this.network = network
    this.chainId = network === 'ethereum' ? 1 : 42161
    this.tokenSymbol = 'ETH'
  }

  async fetchPage(
    address: string,
    cursor: string | null,
    apiKey?: string
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      chainid: String(this.chainId),
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      sort: 'desc',
      offset: '100',
      page: cursor ?? '1',
    })
    if (apiKey) params.set('apikey', apiKey)

    const url = `https://api.etherscan.io/v2/api?${params}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`)

    const json = await res.json()
    if (json.status === '0') return []
    return json.result as RawTransaction[]
  }

  normalize(raw: RawTransaction, address: string): Transaction {
    const timeStamp = Number(raw.timeStamp as string)
    const value = (raw.value as string) ?? '0'
    const gasUsed = (raw.gasUsed as string) ?? '0'
    const gasPrice = (raw.gasPrice as string) ?? '0'
    const to = (raw.to as string) ?? ''
    const from = (raw.from as string) ?? ''
    const hash = (raw.hash as string) ?? ''

    return {
      date: new Date(timeStamp * 1000).toISOString(),
      txHash: hash,
      direction: to.toLowerCase() === address.toLowerCase() ? 'IN' : 'OUT',
      from,
      to,
      // amount is always a decimal string — never a number
      amount: formatUnits(value, 18),
      token: this.tokenSymbol,
      network: this.network,
      fee: formatUnits(String(BigInt(gasUsed) * BigInt(gasPrice)), 18),
      txUrl: this.getTxUrl(hash),
    }
  }

  getNextCursor(page: RawTransaction[]): string | null {
    return page.length === 100 ? null : null // page-based, handled externally
  }

  getTxUrl(txHash: string): string {
    const base = this.network === 'ethereum'
      ? 'https://etherscan.io'
      : 'https://arbiscan.io'
    return `${base}/tx/${txHash}`
  }

  getRateLimitMs(): number {
    return 200
  }
}
