'use client'
import React from 'react'
import { upsertIncident, deleteIncident, allIncidents, countIncidents, clearIncidents, bulkPutIncidents } from '@/db'
import { supabase, isSupabaseConfigured } from '@/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Incident } from '@/types'
import { uid, incidentsToCSV, downloadFile, todayStamp, periodKey, periodLabel, currentPeriodKey } from '@/utils'
import IncidentForm from '@/components/IncidentForm'
import IncidentCard from '@/components/IncidentCard'
import Toolbar from '@/components/Toolbar'
import StatCards from '@/components/StatCards'
import ThemeToggle from '@/components/ThemeToggle'
import ConfirmModal from '@/components/ConfirmModal'
import Login from '@/components/Login'

type Mode = { kind: 'list' } | { kind: 'edit', inc: Incident } | { kind: 'create', inc: Incident }
type StatusFilter = 'all' | 'open' | 'in_progress' | 'completed'
type SortBy = 'recent' | 'oldest' | 'amount' | 'status'

export default function Page() {
  const [mode, setMode] = React.useState<Mode>({ kind: 'list' })
  const [items, setItems] = React.useState<Incident[]>([])
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [periodFilter, setPeriodFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<SortBy>('recent')
  const [signature, setSignature] = React.useState(false)

  const [deleteTarget, setDeleteTarget] = React.useState<Incident | null>(null)
  const [pendingImport, setPendingImport] = React.useState<Incident[] | null>(null)

  // undefined = cargando sesión; null = sin sesión; Session = con sesión
  const [session, setSession] = React.useState<Session | null | undefined>(undefined)

  const refresh = React.useCallback(async () => {
    try {
      const list = await allIncidents()
      setItems(list)
    } catch {
      setItems([])
    }
  }, [])

  // Manejo de sesión
  React.useEffect(() => {
    // mensaje oculto 🥭
    console.log('%c Operado por Ar 🥭 ', 'background:#6366f1;color:#fff;font-weight:bold;padding:4px 8px;border-radius:6px')

    supabase.auth.getSession().then(({ data }) => {
      // Opción "no mantener sesión": cerrar al abrir en una pestaña nueva
      try {
        if (data.session && localStorage.getItem('logout-on-close') === '1' && !sessionStorage.getItem('session-active')) {
          supabase.auth.signOut()
          setSession(null)
          return
        }
        sessionStorage.setItem('session-active', '1')
      } catch {}
      setSession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Cargar datos cuando hay sesión
  React.useEffect(() => {
    if (session) {
      refresh()
    } else if (session === null) {
      setItems([])
    }
  }, [session, refresh])

  const logout = async () => {
    await supabase.auth.signOut()
    setMode({ kind: 'list' })
  }

  const newIncident = (): Incident => ({
    id: uid('inc_'),
    title: '',
    description: '',
    reportedAt: new Date().toISOString(),
    scalaAt: new Date().toISOString(),
    correspondent: '',
    area: '',
    controlCompanion: '',
    isFinancial: false,
    amount: undefined,
    currency: 'MXN',
    rootCause: '',
    status: 'open',
    followUpNote: '',
    nextSessionAt: undefined,
    sessions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const onSave = async (inc: Incident) => {
    await upsertIncident(inc)
    setMode({ kind: 'list' })
    await refresh()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteIncident(deleteTarget.id)
    setDeleteTarget(null)
    await refresh()
  }

  const onDuplicate = (inc: Incident) => {
    const copy: Incident = {
      ...inc,
      id: uid('inc_'),
      title: `${inc.title} (copia)`,
      status: 'open',
      sessions: [],
      followUpNote: '',
      reportedAt: new Date().toISOString(),
      scalaAt: new Date().toISOString(),
      nextSessionAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // Se abre en el formulario; no se guarda hasta que confirmes
    setMode({ kind: 'create', inc: copy })
  }

  // --- Trimestres disponibles (con base en la fecha de SCALA) ---
  // Si un registro no tiene fecha de SCALA, se usa la fecha de reporte como respaldo.
  const scalaPeriod = (i: Incident) => periodKey(i.scalaAt ?? i.reportedAt)
  const periodSet = new Set(items.map(scalaPeriod))
  periodSet.add(currentPeriodKey())
  const periods = Array.from(periodSet).sort().reverse()

  // Incidentes del trimestre seleccionado (alimenta dashboard y conteos)
  const periodItems = periodFilter === 'all'
    ? items
    : items.filter(i => scalaPeriod(i) === periodFilter)

  // --- Filtro + orden ---
  const statusRank = { open: 0, in_progress: 1, completed: 2 }
  const filtered = periodItems
    .filter(i => {
      const txt = (i.title + ' ' + i.description + ' ' + i.correspondent + ' ' + i.area + ' ' + i.rootCause).toLowerCase()
      const passText = txt.includes(query.toLowerCase())
      const passStatus = statusFilter === 'all' ? true : i.status === statusFilter
      return passText && passStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.reportedAt.localeCompare(b.reportedAt)
        case 'amount': return (b.amount ?? -1) - (a.amount ?? -1)
        case 'status': return statusRank[a.status] - statusRank[b.status]
        case 'recent':
        default: return b.reportedAt.localeCompare(a.reportedAt)
      }
    })

  const counts = {
    all: periodItems.length,
    open: periodItems.filter(i => i.status === 'open').length,
    in_progress: periodItems.filter(i => i.status === 'in_progress').length,
    completed: periodItems.filter(i => i.status === 'completed').length,
  }

  // --- Export / Import ---
  const exportJSON = () => {
    downloadFile(JSON.stringify(items, null, 2), `incidentes-${todayStamp()}.json`, 'application/json')
  }

  const exportCSV = () => {
    if (items.length === 0) { alert('No hay incidentes para exportar.'); return }
    downloadFile(incidentsToCSV(items), `incidentes-${todayStamp()}.csv`, 'text/csv;charset=utf-8')
  }

  const importJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (!Array.isArray(data)) throw new Error('formato')
        setPendingImport(data as Incident[])
      } catch {
        alert('Archivo inválido: se esperaba un JSON exportado por esta app.')
      }
    }
    reader.readAsText(file)
  }

  const runImport = async (strategy: 'replace' | 'merge') => {
    if (!pendingImport) return
    try {
      const before = await countIncidents()
      if (strategy === 'replace') await clearIncidents()
      await bulkPutIncidents(pendingImport)
      const after = await countIncidents()
      setPendingImport(null)
      await refresh()
      if (strategy === 'replace') {
        alert(`Se reemplazó todo. Ahora hay ${after} incidentes.`)
      } else {
        const added = after - before
        alert(`Combinado: ${added} nuevos, ${pendingImport.length - Math.max(added, 0)} actualizados.`)
      }
    } catch {
      alert('No se pudo importar. Revisa tu conexión e inténtalo de nuevo.')
      setPendingImport(null)
    }
  }

  const filters: { key: StatusFilter, label: string }[] = [
    { key: 'all', label: `Todos · ${counts.all}` },
    { key: 'open', label: `Abiertos · ${counts.open}` },
    { key: 'in_progress', label: `En progreso · ${counts.in_progress}` },
    { key: 'completed', label: `Completados · ${counts.completed}` },
  ]

  // Portón de autenticación
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="card max-w-md p-7 text-center">
          <div className="text-3xl">🔧</div>
          <h1 className="mt-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">Falta configurar Supabase</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Agrega las variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (en <code>.env.local</code> y en Vercel) para activar el inicio de sesión.
          </p>
        </div>
      </main>
    )
  }
  if (session === undefined) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-neutral-400">Cargando…</main>
  }
  if (session === null) {
    return <Login />
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">
      {/* Encabezado */}
      <header className="mb-8 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={()=>setSignature(s=>!s)}
            title="◆"
            aria-label="logo"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-xl font-black text-white shadow-pop transition active:scale-95"
          >◆</button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">Gestor de Incidentes</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Seguimiento local · tus datos nunca salen de este equipo</p>
            {signature && (
              <p className="mt-1 text-xs font-semibold text-brand-600 dark:text-brand-400">Operado por Ar 🥭</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={logout} className="btn-ghost !py-2" title="Cerrar sesión">Salir</button>
        </div>
        {/* mensaje oculto */}
        <span className="sr-only">Operado por Ar 🥭</span>
      </header>

      {mode.kind === 'list' && (
        <div className="space-y-5">
          <StatCards items={periodItems} />

          <Toolbar
            onNew={() => setMode({ kind: 'create', inc: newIncident() })}
            onExport={exportJSON}
            onExportCSV={exportCSV}
            onImport={importJSON}
          />

          {/* Filtro por trimestre (proceso trimestral) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Trimestre:</span>
            <button
              onClick={() => setPeriodFilter('all')}
              className={periodFilter === 'all' ? 'chip-on' : 'chip-off'}
            >Todos</button>
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={periodFilter === p ? 'chip-on' : 'chip-off'}
              >{periodLabel(p)}{p === currentPeriodKey() ? ' • actual' : ''}</button>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={statusFilter === f.key ? 'chip-on' : 'chip-off'}
                >{f.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value as SortBy)} className="field md:w-48" title="Ordenar">
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="amount">Mayor monto</option>
                <option value="status">Por estatus</option>
              </select>
              <div className="relative md:w-64">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
                <input
                  placeholder="Buscar…"
                  value={query}
                  onChange={e=>setQuery(e.target.value)}
                  className="field pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(inc => (
              <IncidentCard
                key={inc.id}
                inc={inc}
                onEdit={(i)=>setMode({ kind: 'edit', inc: i })}
                onDelete={setDeleteTarget}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
              <div className="text-4xl">🗂️</div>
              <div className="font-semibold text-neutral-700 dark:text-neutral-200">No hay incidentes que mostrar</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {items.length === 0 ? 'Crea tu primer incidente con el botón «Nuevo incidente».' : 'Prueba cambiando el filtro o la búsqueda.'}
              </div>
            </div>
          )}
        </div>
      )}

      {mode.kind !== 'list' && (
        <div className="space-y-4">
          <button className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400" onClick={()=>setMode({ kind:'list' })}>← Volver a la lista</button>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {mode.kind === 'create' ? 'Nuevo incidente' : 'Editar incidente'}
          </h2>
          <IncidentForm
            value={mode.inc}
            onChange={(v)=>setMode({ ...mode, inc: v } as Mode)}
            onSave={()=>onSave(mode.inc)}
            onCancel={()=>setMode({ kind: 'list' })}
          />
        </div>
      )}

      {/* Modal: eliminar */}
      <ConfirmModal
        open={!!deleteTarget}
        danger
        title="Eliminar incidente"
        message={<>¿Seguro que quieres eliminar <strong>«{deleteTarget?.title || 'Sin título'}»</strong>? Esta acción no se puede deshacer.</>}
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={()=>setDeleteTarget(null)}
      />

      {/* Modal: estrategia de importación */}
      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={()=>setPendingImport(null)} />
          <div className="card relative w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Importar {pendingImport.length} incidentes</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              ¿Cómo quieres importar? <strong>Reemplazar</strong> borra los actuales y deja solo los del archivo.
              <strong> Combinar</strong> mantiene los tuyos y agrega/actualiza los del archivo.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={()=>runImport('merge')} className="btn-primary">Combinar (recomendado)</button>
              <button onClick={()=>runImport('replace')} className="btn-danger">Reemplazar todo</button>
              <button onClick={()=>setPendingImport(null)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
