'use client'
import React from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
      className="btn-ghost !px-3 !py-2 text-lg"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
