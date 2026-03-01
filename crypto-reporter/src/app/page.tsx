'use client'

import { useState, useCallback } from 'react'
import AddressInput from '@/components/AddressInput'
import DateRangePicker from '@/components/DateRangePicker'
import GenerateButton from '@/components/GenerateButton'
import ReportResult from '@/components/ReportResult'
import { Network } from '@/types/network'

type ReportState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; fileName: string; fileSize: string; txCount: number; fileUrl: string }
  | { status: 'error'; message: string }

export default function Home() {
  const today = new Date().toISOString().slice(0, 10)
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<Network | null>(null)
  const [dateFrom, setDateFrom] = useState(yearAgo)
  const [dateTo, setDateTo] = useState(today)
  const [reportState, setReportState] = useState<ReportState>({ status: 'idle' })

  const handleNetworkDetected = useCallback((addr: string, net: Network) => {
    setAddress(addr)
    setNetwork(net)
    setReportState({ status: 'idle' })
  }, [])

  const handleRangeChange = useCallback((from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }, [])

  const handleGenerate = async () => {
    if (!address || !network) return

    setReportState({ status: 'generating' })
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, network, dateFrom, dateTo }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setReportState({ status: 'error', message: data.message || 'Ошибка генерации отчёта' })
        return
      }

      setReportState({
        status: 'done',
        fileName: data.fileName,
        fileSize: data.fileSize,
        txCount: data.txCount,
        fileUrl: data.fileUrl,
      })
    } catch {
      setReportState({ status: 'error', message: 'Ошибка соединения с сервером' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Crypto Reporter</h1>
          <a href="/settings/integrations" className="text-sm text-gray-500 hover:text-gray-900">
            Настройки
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Отчёт о транзакциях</h2>

          <AddressInput onNetworkDetected={handleNetworkDetected} />

          {network && (
            <DateRangePicker onRangeChange={handleRangeChange} />
          )}

          <GenerateButton
            disabled={!network}
            loading={reportState.status === 'generating'}
            onClick={handleGenerate}
          />

          {reportState.status === 'error' && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {reportState.message}
            </div>
          )}

          {reportState.status === 'done' && (
            <ReportResult
              fileName={reportState.fileName}
              fileSize={reportState.fileSize}
              txCount={reportState.txCount}
              fileUrl={reportState.fileUrl}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Поддерживаемые сети: Ethereum · Bitcoin · Tron · Arbitrum
        </p>
      </main>
    </div>
  )
}
