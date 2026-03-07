import { Network } from '@/types/network'
import { isEVMAddress, isBitcoinAddress, isTronAddress } from '@/lib/address-validators'

export async function detectNetwork(
  address: string,
  apiKey?: string
): Promise<Network> {
  const trimmed = address.trim()

  if (isBitcoinAddress(trimmed)) return 'bitcoin'
  if (isTronAddress(trimmed)) return 'tron'

  if (isEVMAddress(trimmed)) {
    // Try Ethereum first, then Arbitrum
    const ethResult = await probeEtherscan(trimmed, 1, apiKey)
    if (ethResult) return 'ethereum'

    const arbResult = await probeEtherscan(trimmed, 42161, apiKey)
    if (arbResult) return 'arbitrum'

    // Default to ethereum for EVM addresses if no transactions found
    return 'ethereum'
  }

  throw new Error('UNSUPPORTED_NETWORK')
}

async function probeEtherscan(
  address: string,
  chainId: number,
  apiKey?: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      chainid: String(chainId),
      module: 'account',
      action: 'txlist',
      address,
      page: '1',
      offset: '1',
      sort: 'desc',
    })
    if (apiKey) params.set('apikey', apiKey)

    const res = await fetch(`https://api.etherscan.io/v2/api?${params}`)
    if (!res.ok) return false
    const json = await res.json()
    return json.status === '1' && Array.isArray(json.result) && json.result.length > 0
  } catch {
    return false
  }
}
