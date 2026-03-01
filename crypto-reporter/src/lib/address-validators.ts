import { Network } from '@/types/network'
import { EVM_ADDRESS_REGEX, BITCOIN_ADDRESS_REGEX, TRON_ADDRESS_REGEX } from './constants'

export type ValidationResult =
  | { valid: true; network: Network }
  | { valid: false; error: 'INVALID_FORMAT' | 'UNSUPPORTED_NETWORK'; message: string }

export function validateAddress(address: string): ValidationResult {
  const trimmed = address.trim()

  if (!trimmed) {
    return { valid: false, error: 'INVALID_FORMAT', message: 'Неверный формат адреса' }
  }

  if (isEvmAddress(trimmed)) {
    // Could be Ethereum or Arbitrum — resolved by NetworkDetectionService via API probe
    return { valid: true, network: 'ethereum' }
  }

  if (isBitcoinAddress(trimmed)) {
    return { valid: true, network: 'bitcoin' }
  }

  if (isTronAddress(trimmed)) {
    return { valid: true, network: 'tron' }
  }

  // Check if it looks like a crypto address but is unsupported
  if (looksLikeCryptoAddress(trimmed)) {
    return { valid: false, error: 'UNSUPPORTED_NETWORK', message: 'Сеть не поддерживается' }
  }

  return { valid: false, error: 'INVALID_FORMAT', message: 'Неверный формат адреса' }
}

export function isEvmAddress(address: string): boolean {
  return EVM_ADDRESS_REGEX.test(address)
}

export function isBitcoinAddress(address: string): boolean {
  return BITCOIN_ADDRESS_REGEX.test(address)
}

export function isTronAddress(address: string): boolean {
  return TRON_ADDRESS_REGEX.test(address)
}

// Detects base58 / bech32 style addresses that don't match supported networks
function looksLikeCryptoAddress(address: string): boolean {
  // Solana: base58, 32–44 chars, starts with various chars
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return solanaRegex.test(address)
}
