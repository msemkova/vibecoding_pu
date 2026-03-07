'use client'

type Props = {
  loading: boolean
  message?: string
}

export function ProgressBar({ loading, message }: Props) {
  if (!loading) return null

  return (
    <div className="space-y-2">
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 animate-pulse w-3/4" />
      </div>
      {message && (
        <p className="text-xs text-gray-500 text-center">{message}</p>
      )}
    </div>
  )
}
