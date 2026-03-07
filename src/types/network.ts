export type Network = 'ethereum' | 'bitcoin' | 'tron' | 'arbitrum'

export type NetworkConfig = {
  name: string
  chainId?: number
  explorerUrl: string
  apiBaseUrl: string
  addressRegex: RegExp
  requiresApiKey: boolean
}

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    apiBaseUrl: 'https://api.etherscan.io/v2/api',
    addressRegex: /^0x[0-9a-fA-F]{40}$/,
    requiresApiKey: true,
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    apiBaseUrl: 'https://api.etherscan.io/v2/api',
    addressRegex: /^0x[0-9a-fA-F]{40}$/,
    requiresApiKey: true,
  },
  bitcoin: {
    name: 'Bitcoin',
    explorerUrl: 'https://mempool.space',
    apiBaseUrl: 'https://blockstream.info/api',
    addressRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    requiresApiKey: false,
  },
  tron: {
    name: 'Tron',
    explorerUrl: 'https://tronscan.org',
    apiBaseUrl: 'https://apilist.tronscanapi.com/api',
    addressRegex: /^T[a-zA-Z0-9]{33}$/,
    requiresApiKey: true,
  },
}
