import { describe, it, expect } from 'vitest'
import {
  validateAddress,
  isEvmAddress,
  isBitcoinAddress,
  isTronAddress,
} from '@/lib/address-validators'

describe('isEvmAddress', () => {
  it('accepts valid Ethereum address', () => {
    expect(isEvmAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18')).toBe(true)
  })

  it('accepts lowercase hex', () => {
    expect(isEvmAddress('0xabcdef1234567890abcdef1234567890abcdef12')).toBe(true)
  })

  it('rejects address without 0x prefix', () => {
    expect(isEvmAddress('742d35Cc6634C0532925a3b844Bc9e7595f2bD18')).toBe(false)
  })

  it('rejects address that is too short', () => {
    expect(isEvmAddress('0x742d35')).toBe(false)
  })

  it('rejects address with non-hex characters', () => {
    expect(isEvmAddress('0xGGGd35Cc6634C0532925a3b844Bc9e7595f2bD18')).toBe(false)
  })
})

describe('isBitcoinAddress', () => {
  it('accepts Bech32 (bc1) address', () => {
    expect(isBitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(true)
  })

  it('accepts legacy P2PKH address (starts with 1)', () => {
    expect(isBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf Na')).toBe(false)
    expect(isBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true)
  })

  it('accepts P2SH address (starts with 3)', () => {
    expect(isBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true)
  })

  it('rejects a Tron address', () => {
    expect(isBitcoinAddress('TJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC')).toBe(false)
  })
})

describe('isTronAddress', () => {
  it('accepts valid Tron address', () => {
    expect(isTronAddress('TJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC')).toBe(true)
  })

  it('rejects address not starting with T', () => {
    expect(isTronAddress('AJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC')).toBe(false)
  })

  it('rejects short Tron address', () => {
    expect(isTronAddress('TABC')).toBe(false)
  })
})

describe('validateAddress', () => {
  it('returns ethereum for valid EVM address', () => {
    const result = validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18')
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.network).toBe('ethereum')
  })

  it('returns bitcoin for bc1 address', () => {
    const result = validateAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.network).toBe('bitcoin')
  })

  it('returns tron for T address', () => {
    const result = validateAddress('TJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC')
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.network).toBe('tron')
  })

  it('returns INVALID_FORMAT for empty string', () => {
    const result = validateAddress('')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('INVALID_FORMAT')
  })

  it('returns INVALID_FORMAT for garbage input', () => {
    const result = validateAddress('invalid_address')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('INVALID_FORMAT')
  })

  it('trims whitespace before validating', () => {
    const result = validateAddress('  0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18  ')
    expect(result.valid).toBe(true)
  })

  it('returns UNSUPPORTED_NETWORK for Solana-like address', () => {
    // Solana: base58, 32-44 chars
    const result = validateAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('UNSUPPORTED_NETWORK')
  })
})
