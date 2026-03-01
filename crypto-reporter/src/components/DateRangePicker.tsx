'use client'

import { useState, useEffect } from 'react'

type Props = {
  onRangeChange: (dateFrom: string, dateTo: string) => void
}

export default function DateRangePicker({ onRangeChange }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [dateFrom, setDateFrom] = useState(yearAgo)
  const [dateTo, setDateTo] = useState(today)

  const rangeExceedsYear = () => {
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    const diffMs = to.getTime() - from.getTime()
    return diffMs > 365 * 24 * 60 * 60 * 1000
  }

  useEffect(() => {
    if (dateFrom && dateTo) {
      onRangeChange(dateFrom, dateTo)
    }
  }, [dateFrom, dateTo, onRangeChange])

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">Период</label>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">С</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">По</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            max={today}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      {rangeExceedsYear() && (
        <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          ⚠ Диапазон превышает 1 год — генерация может занять больше времени
        </div>
      )}
    </div>
  )
}
