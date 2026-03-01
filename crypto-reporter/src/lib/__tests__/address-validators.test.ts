import { describe, it, expect } from 'vitest'
import {
  validateEthAddress,
  validateBitcoinAddress,
  validateTronAddress,
  validateAddress,
} from '../address-validators'

describe('validateEthAddress', () => {
  it('accepts valid lowercase ETH address', () => {
    expect(
      validateEthAddress('0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9')
    ).toEqual({ valid: true })
  })

  it('accepts valid checksummed ETH address', () => {
    expect(
      validateEthAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    ).toEqual({ valid: true })
  })

  it('rejects address without 0x prefix', () => {
    const result = validateEthAddress('742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9')
    expect(result.valid).toBe(false)
  })

  it('rejects address that is too short', () => {
    expect(validateEthAddress('0x742d35cc')).toEqual({
      valid: false,
      error: 'Invalid Ethereum address format',
    })
  })

  it('rejects address with invalid characters', () => {
    expect(validateEthAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toEqual({
      valid: false,
      error: 'Invalid Ethereum address format',
    })
  })

  it('rejects empty string', () => {
    expect(validateEthAddress('')).toEqual({
      valid: false,
      error: 'Invalid Ethereum address format',
    })
  })
})

describe('validateBitcoinAddress', () => {
  it('accepts P2PKH address (starts with 1)', () => {
    expect(validateBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna')).toEqual({
      valid: true,
    })
  })

  it('accepts P2SH address (starts with 3)', () => {
    expect(validateBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toEqual({
      valid: true,
    })
  })

  it('accepts bech32 address (starts with bc1)', () => {
    expect(
      validateBitcoinAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')
    ).toEqual({ valid: true })
  })

  it('rejects Ethereum address', () => {
    expect(
      validateBitcoinAddress('0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9')
    ).toEqual({ valid: false, error: 'Invalid Bitcoin address format' })
  })

  it('rejects empty string', () => {
    expect(validateBitcoinAddress('')).toEqual({
      valid: false,
      error: 'Invalid Bitcoin address format',
    })
  })
})

describe('validateTronAddress', () => {
  it('accepts valid Tron address', () => {
    expect(validateTronAddress('TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy')).toEqual({
      valid: true,
    })
  })

  it('rejects address not starting with T', () => {
    expect(validateTronAddress('1LsV52sRDL79HXGGm9yzwKibb6BeruhUzy')).toEqual({
      valid: false,
      error: 'Invalid Tron address format',
    })
  })

  it('rejects too short address', () => {
    expect(validateTronAddress('TLsV52sR')).toEqual({
      valid: false,
      error: 'Invalid Tron address format',
    })
  })

  it('rejects empty string', () => {
    expect(validateTronAddress('')).toEqual({
      valid: false,
      error: 'Invalid Tron address format',
    })
  })
})

describe('validateAddress (dispatch)', () => {
  it('dispatches ethereum network to ETH validator', () => {
    expect(
      validateAddress('0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9', 'ethereum')
    ).toEqual({ valid: true })
  })

  it('dispatches arbitrum network to ETH validator', () => {
    expect(
      validateAddress('0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9', 'arbitrum')
    ).toEqual({ valid: true })
  })

  it('dispatches bitcoin network to BTC validator', () => {
    expect(
      validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', 'bitcoin')
    ).toEqual({ valid: true })
  })

  it('dispatches tron network to TRX validator', () => {
    expect(validateAddress('TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy', 'tron')).toEqual(
      { valid: true }
    )
  })

  it('trims whitespace before validating', () => {
    expect(
      validateAddress('  0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9  ', 'ethereum')
    ).toEqual({ valid: true })
  })
})
