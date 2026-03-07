'use client'

type ReportInfo = {
  fileUrl: string
  fileName: string
  fileSize: string
  txCount: number
}

type Props = {
  report: ReportInfo
}

export function ReportResult({ report }: Props) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <svg
          className="h-8 w-8 text-green-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900">{report.fileName}</p>
          <p className="text-xs text-gray-500">
            {report.txCount} транзакций · {report.fileSize}
          </p>
        </div>
      </div>
      <a
        href={report.fileUrl}
        download={report.fileName}
        className="block w-full rounded-md bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
      >
        Download CSV
      </a>
    </div>
  )
}
