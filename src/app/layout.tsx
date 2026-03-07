import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crypto Reporter',
  description: 'Generate CSV reports for crypto wallet transactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
