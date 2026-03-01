import { NetworkConfig } from '@/types/network'

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
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
    explorerUrl: 'https://blockstream.info',
    apiBaseUrl: 'https://blockstream.info/api',
    addressRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    requiresApiKey: false,
  },
  tron: {
    name: 'Tron',
    explorerUrl: 'https://tronscan.org',
    apiBaseUrl: 'https://apilist.tronscanapi.com/api',
    addressRegex: /^T[a-zA-Z0-9]{33}$/,
    requiresApiKey: false,
  },
}

export const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/
export const BITCOIN_ADDRESS_REGEX = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/
export const TRON_ADDRESS_REGEX = /^T[a-zA-Z0-9]{33}$/

export const RATE_LIMIT_DELAY_MS = 200
export const AUTO_LOCK_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
export const PBKDF2_ITERATIONS = 100_000
export const MAX_REPORT_TTL_MS = 10 * 60 * 1000 // 10 minutes
