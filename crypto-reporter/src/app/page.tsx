'use client'

import { useState } from 'react'
import { detectNetwork } from '@/services/network-detection'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function firstOfMonthStr() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; count: number }
  | { type: 'error'; message: string }

// ---------------------------------------------------------------------------
// Network badge
// ---------------------------------------------------------------------------

function NetworkBadge({ address }: { address: string }) {
  const trimmed = address.trim()
  if (!trimmed) return null

  const result = detectNetwork(trimmed)

  if (!result.ok) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Invalid address
      </span>
    )
  }

  const network = result.detected.network

  if (network !== 'tron') {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        {network} — not supported in MVP
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Tron
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const [address, setAddress] = useState('')
  const [dateFrom, setDateFrom] = useState(firstOfMonthStr())
  const [dateTo, setDateTo] = useState(todayStr())
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  const detection = address.trim() ? detectNetwork(address.trim()) : null
  const isTron = detection?.ok && detection.detected.network === 'tron'
  const canSubmit = isTron && dateFrom && dateTo && status.type !== 'loading'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setStatus({ type: 'loading' })

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), dateFrom, dateTo }),
      })

      if (!res.ok) {
        const json = await res.json()
        setStatus({ type: 'error', message: json.error ?? 'Request failed' })
        return
      }

      const txCount = Number(res.headers.get('X-Tx-Count') ?? 0)
      const csv = await res.text()

      // Trigger browser download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tron-${address.trim().slice(0, 10)}-${dateFrom}-${dateTo}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatus({ type: 'success', count: txCount })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Network error' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Crypto Report
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Download transaction history as CSV
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Wallet address
              </label>
              <NetworkBadge address={address} />
            </div>
            <input
              type="text"
              value={address}
              onChange={e => { setAddress(e.target.value); setStatus({ type: 'idle' }) }}
              placeholder="T…"
              spellCheck={false}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={e => { setDateFrom(e.target.value); setStatus({ type: 'idle' }) }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={todayStr()}
                onChange={e => { setDateTo(e.target.value); setStatus({ type: 'idle' }) }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              />
            </div>
          </div>

          {/* Status messages */}
          {status.type === 'error' && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {status.message}
            </div>
          )}
          {status.type === 'success' && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Done — {status.count} transaction{status.count !== 1 ? 's' : ''} exported.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {status.type === 'loading' ? 'Fetching…' : 'Download CSV'}
          </button>

        </form>
      </div>
    </div>
  )
}
