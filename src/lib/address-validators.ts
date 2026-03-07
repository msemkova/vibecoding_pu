import { Network } from '@/types/network'

const ADDRESS_PATTERNS: Record<Network, RegExp> = {
  ethereum: /^0x[0-9a-fA-F]{40}$/,
  arbitrum: /^0x[0-9a-fA-F]{40}$/,
  bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  tron: /^T[a-zA-Z0-9]{33}$/,
}

export function isValidAddress(address: string, network: Network): boolean {
  return ADDRESS_PATTERNS[network].test(address.trim())
}

export function isEVMAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address.trim())
}

export function isBitcoinAddress(address: string): boolean {
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address.trim())
}

export function isTronAddress(address: string): boolean {
  return /^T[a-zA-Z0-9]{33}$/.test(address.trim())
}
