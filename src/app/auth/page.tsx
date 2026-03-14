'use client'

import { useState } from 'react'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'register') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error ?? 'Ошибка регистрации')
        return
      }
      setSuccess('Пароль отправлен на ваш email. Войдите с полученными данными.')
      setMode('login')
      return
    }

    // Login
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Ошибка входа')
      return
    }
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto Reporter</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Пароль из письма"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Загрузка...'
              : mode === 'login'
                ? 'Войти'
                : 'Получить пароль на email'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
                className="text-blue-600 hover:underline"
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                className="text-blue-600 hover:underline"
              >
                Войти
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
