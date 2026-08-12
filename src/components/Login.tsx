'use client'
import React from 'react'
import { supabase } from '@/supabase'

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [keep, setKeep] = React.useState(true)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setError('Usuario o contraseña incorrectos.')
      return
    }
    // Si NO quiere mantener sesión, se cerrará al cerrar la pestaña
    try {
      if (keep) localStorage.removeItem('logout-on-close')
      else localStorage.setItem('logout-on-close', '1')
    } catch {}
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="card w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-black text-white shadow-pop">◆</div>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">Gestor de Incidentes</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Usuario (correo)</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              className="field"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="label">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <input type="checkbox" checked={keep} onChange={e=>setKeep(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" />
            Mantener sesión iniciada
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
