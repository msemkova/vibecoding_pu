import {
  validateEthAddress,
  validateBitcoinAddress,
  validateTronAddress,
} from '@/lib/address-validators'
import type { Network, DetectedAddress } from '@/types'

export interface NetworkDetectionResult {
  ok: true
  detected: DetectedAddress
}

export interface NetworkDetectionError {
  ok: false
  error: string
}

export type DetectNetworkResult = NetworkDetectionResult | NetworkDetectionError

export function detectNetwork(address: string): DetectNetworkResult {
  const trimmed = address.trim()

  if (!trimmed) {
    return { ok: false, error: 'Address is required' }
  }

  // Ethereum / Arbitrum — same address format, disambiguated later by user or context
  if (validateEthAddress(trimmed).valid) {
    const network: Network = 'ethereum'
    return { ok: true, detected: { address: trimmed, network } }
  }

  if (validateBitcoinAddress(trimmed).valid) {
    return { ok: true, detected: { address: trimmed, network: 'bitcoin' } }
  }

  if (validateTronAddress(trimmed).valid) {
    return { ok: true, detected: { address: trimmed, network: 'tron' } }
  }

  return { ok: false, error: 'Unknown address format' }
}
