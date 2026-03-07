'use client'

import { useState } from 'react'
import { Network } from '@/types/network'
import { AddressInput } from '@/components/AddressInput'
import { DateRangePicker } from '@/components/DateRangePicker'
import { ProgressBar } from '@/components/ProgressBar'
import { ReportResult } from '@/components/ReportResult'

type ReportInfo = {
  fileUrl: string
  fileName: string
  fileSize: string
  txCount: number
}

export default function HomePage() {
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<Network | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ReportInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleAddressDetected(addr: string, net: Network) {
    setAddress(addr)
    setNetwork(net)
    setReport(null)
    setError(null)
  }

  function handleDateChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    setReport(null)
    setError(null)
  }

  async function handleGenerate() {
    if (!address || !network || !dateFrom || !dateTo) return
    setLoading(true)
    setReport(null)
    setError(null)

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, network, dateFrom, dateTo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ошибка генерации отчёта')
        return
      }
      setReport(data)
    } catch {
      setError('Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = Boolean(address && network && dateFrom && dateTo && !loading)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto Reporter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Генерация CSV-отчётов по транзакциям кошелька
          </p>
        </div>

        <AddressInput onDetected={handleAddressDetected} />

        {network && (
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
          />
        )}

        {network && (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Сформировать отчёт
          </button>
        )}

        <ProgressBar loading={loading} message="Получение транзакций..." />

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {report && <ReportResult report={report} />}
      </div>
    </main>
  )
}
