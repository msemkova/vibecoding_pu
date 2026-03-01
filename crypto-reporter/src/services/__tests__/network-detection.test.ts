import { describe, it, expect } from 'vitest'
import { detectNetwork } from '../network-detection'

describe('detectNetwork', () => {
  it('detects Ethereum address', () => {
    const result = detectNetwork('0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9')
    expect(result).toEqual({
      ok: true,
      detected: {
        address: '0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9',
        network: 'ethereum',
      },
    })
  })

  it('detects Bitcoin P2PKH address', () => {
    const result = detectNetwork('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna')
    expect(result).toEqual({
      ok: true,
      detected: {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna',
        network: 'bitcoin',
      },
    })
  })

  it('detects Bitcoin bech32 address', () => {
    const result = detectNetwork('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')
    expect(result).toEqual({
      ok: true,
      detected: {
        address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        network: 'bitcoin',
      },
    })
  })

  it('detects Tron address', () => {
    const result = detectNetwork('TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy')
    expect(result).toEqual({
      ok: true,
      detected: {
        address: 'TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy',
        network: 'tron',
      },
    })
  })

  it('trims whitespace', () => {
    const result = detectNetwork('  0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9  ')
    expect(result).toEqual({
      ok: true,
      detected: {
        address: '0x742d35cc6634c0532925a3b8d4c9e9e9e9e9e9e9',
        network: 'ethereum',
      },
    })
  })

  it('returns error for empty address', () => {
    expect(detectNetwork('')).toEqual({ ok: false, error: 'Address is required' })
  })

  it('returns error for unknown format', () => {
    expect(detectNetwork('not-an-address')).toEqual({
      ok: false,
      error: 'Unknown address format',
    })
  })

  it('returns error for random string', () => {
    const result = detectNetwork('xyz123')
    expect(result.ok).toBe(false)
  })
})
