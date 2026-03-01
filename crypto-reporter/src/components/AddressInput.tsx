'use client'

import { useState, useCallback } from 'react'
import { Network } from '@/types/network'
import { NETWORK_CONFIGS } from '@/lib/constants'

type Props = {
  onNetworkDetected: (address: string, network: Network) => void
}

type State =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'detected'; network: Network }
  | { status: 'error'; message: string }

export default function AddressInput({ onNetworkDetected }: Props) {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })

  const handleDetect = useCallback(async () => {
    const trimmed = address.trim()
    if (!trimmed) return

    setState({ status: 'validating' })
    try {
      const res = await fetch('/api/detect-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmed }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setState({ status: 'error', message: data.message || 'Ошибка определения сети' })
        return
      }

      setState({ status: 'detected', network: data.network as Network })
      onNetworkDetected(trimmed, data.network as Network)
    } catch {
      setState({ status: 'error', message: 'Ошибка соединения с сервером' })
    }
  }, [address, onNetworkDetected])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDetect()
  }

  const networkName =
    state.status === 'detected' ? NETWORK_CONFIGS[state.network]?.name ?? state.network : null

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Адрес кошелька
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            if (state.status !== 'idle') setState({ status: 'idle' })
          }}
          onKeyDown={handleKeyDown}
          placeholder="0x... / bc1... / T..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Адрес криптокошелька"
        />
        <button
          onClick={handleDetect}
          disabled={!address.trim() || state.status === 'validating'}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === 'validating' ? 'Проверяем...' : 'Определить'}
        </button>
      </div>

      {state.status === 'detected' && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Сеть определена: <span className="font-semibold">{networkName}</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {state.message}
        </div>
      )}
    </div>
  )
}
