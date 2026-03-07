'use client'

type Props = {
  dateFrom: string
  dateTo: string
  onChange: (dateFrom: string, dateTo: string) => void
}

export function DateRangePicker({ dateFrom, dateTo, onChange }: Props) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Период
      </label>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">От</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || today}
            onChange={(e) => onChange(e.target.value, dateTo)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">До</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            max={today}
            onChange={(e) => onChange(dateFrom, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
