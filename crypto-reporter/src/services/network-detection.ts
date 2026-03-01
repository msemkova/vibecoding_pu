import { Network } from '@/types/network'
import { validateAddress, isEvmAddress } from '@/lib/address-validators'

export type NetworkDetectionResult =
  | { network: Network; valid: true }
  | { error: 'INVALID_FORMAT' | 'UNSUPPORTED_NETWORK'; message: string }

export async function detectNetwork(address: string): Promise<NetworkDetectionResult> {
  const validation = validateAddress(address)

  if (!validation.valid) {
    return { error: validation.error, message: validation.message }
  }

  // Bitcoin and Tron are determined by regex alone
  if (validation.network === 'bitcoin' || validation.network === 'tron') {
    return { network: validation.network, valid: true }
  }

  // EVM address: probe Etherscan v2 to distinguish Ethereum vs Arbitrum
  if (isEvmAddress(address.trim())) {
    const network = await probeEvmNetwork(address.trim())
    return { network, valid: true }
  }

  return { error: 'UNSUPPORTED_NETWORK', message: 'Сеть не поддерживается' }
}

async function probeEvmNetwork(address: string): Promise<Network> {
  // Without an API key, default to Ethereum — the network can be refined client-side
  // with user-provided API keys. In a production scenario, a server-side key would
  // be used here to probe both chains.
  try {
    const ethUrl = buildEtherscanUrl(address, 1)
    const res = await fetch(ethUrl, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      if (data.status === '1' && Array.isArray(data.result) && data.result.length > 0) {
        return 'ethereum'
      }
    }
  } catch {
    // Network error or timeout — fall through to default
  }

  try {
    const arbUrl = buildEtherscanUrl(address, 42161)
    const res = await fetch(arbUrl, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      if (data.status === '1' && Array.isArray(data.result) && data.result.length > 0) {
        return 'arbitrum'
      }
    }
  } catch {
    // Network error or timeout
  }

  // Default: assume Ethereum for EVM addresses when no transactions found
  return 'ethereum'
}

function buildEtherscanUrl(address: string, chainId: number): string {
  const apiKey = process.env.ETHERSCAN_API_KEY || ''
  const params = new URLSearchParams({
    chainid: String(chainId),
    module: 'account',
    action: 'txlist',
    address,
    page: '1',
    offset: '1',
    sort: 'desc',
    ...(apiKey && { apikey: apiKey }),
  })
  return `https://api.etherscan.io/v2/api?${params}`
}
