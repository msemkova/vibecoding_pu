import type { Network, ValidationResult } from '@/types'

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const BTC_ADDRESS_RE =
  /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[0-9a-z]{6,87})$/
const TRX_ADDRESS_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/

export function validateEthAddress(address: string): ValidationResult {
  if (!ETH_ADDRESS_RE.test(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' }
  }
  return { valid: true }
}

export function validateBitcoinAddress(address: string): ValidationResult {
  if (!BTC_ADDRESS_RE.test(address)) {
    return { valid: false, error: 'Invalid Bitcoin address format' }
  }
  return { valid: true }
}

export function validateTronAddress(address: string): ValidationResult {
  if (!TRX_ADDRESS_RE.test(address)) {
    return { valid: false, error: 'Invalid Tron address format' }
  }
  return { valid: true }
}

export function validateAddress(
  address: string,
  network: Network
): ValidationResult {
  const trimmed = address.trim()
  switch (network) {
    case 'ethereum':
    case 'arbitrum':
      return validateEthAddress(trimmed)
    case 'bitcoin':
      return validateBitcoinAddress(trimmed)
    case 'tron':
      return validateTronAddress(trimmed)
  }
}
