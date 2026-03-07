'use client'

import { useState } from 'react'
import { Network } from '@/types/network'

type Props = {
  onDetected: (address: string, network: Network) => void
  apiKey?: string
}

export function AddressInput({ onDetected, apiKey }: Props) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)

  async function handleDetect() {
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setNetwork(null)

    try {
      const res = await fetch('/api/detect-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), apiKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Не удалось определить сеть')
        return
      }
      setNetwork(data.network)
      onDetected(address.trim(), data.network)
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Адрес кошелька
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDetect()}
          placeholder="0x... / bc1... / T..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleDetect}
          disabled={loading || !address.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Определение...' : 'Определить сеть'}
        </button>
      </div>
      {network && (
        <p className="text-sm text-green-600">
          Сеть: <span className="font-semibold capitalize">{network}</span>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
