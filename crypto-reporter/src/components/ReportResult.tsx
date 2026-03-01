'use client'

type Props = {
  fileName: string
  fileSize: string
  txCount: number
  fileUrl: string
}

export default function ReportResult({ fileName, fileSize, txCount, fileUrl }: Props) {
  if (!fileUrl) return null

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">{fileSize} · {txCount} транзакций</p>
        </div>
        <a
          href={fileUrl}
          download={fileName}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
        >
          Скачать
        </a>
      </div>
    </div>
  )
}
