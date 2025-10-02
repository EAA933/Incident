'use client'
import React from 'react'
import { upsertIncident, deleteIncident, allIncidents } from '@/db'
import type { Incident } from '@/types'
import { uid } from '@/utils'
import IncidentForm from '@/components/IncidentForm'
import IncidentCard from '@/components/IncidentCard'
import Toolbar from '@/components/Toolbar'

type Mode = { kind: 'list' } | { kind: 'edit', inc: Incident } | { kind: 'create', inc: Incident }

export default function Page() {
  const [mode, setMode] = React.useState<Mode>({ kind: 'list' })
  const [items, setItems] = React.useState<Incident[]>([])
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all'|'open'|'in_progress'|'completed'>('all')

  const refresh = React.useCallback(async () => {
    const list = await allIncidents()
    setItems(list)
  }, [])

  React.useEffect(() => { refresh() }, [refresh])

  const newIncident = (): Incident => ({
    id: uid('inc_'),
    title: '',
    description: '',
    reportedAt: new Date().toISOString(),
    correspondent: '',
    area: '',
    controlCompanion: '',
    isFinancial: false,
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

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar incidente?')) return
    await deleteIncident(id)
    await refresh()
  }

  const filtered = items.filter(i => {
    const txt = (i.title + ' ' + i.description + ' ' + i.correspondent + ' ' + i.area + ' ' + i.rootCause).toLowerCase()
    const passText = txt.includes(query.toLowerCase())
    const passStatus = statusFilter === 'all' ? true : i.status === statusFilter
    return passText && passStatus
  })

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'incidents-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result)) as Incident[]
        // Simple import strategy: replace by ids
        const { db } = await import('@/db')
        await db.transaction('rw', db.incidents, async () => {
          for (const inc of data) await db.incidents.put(inc)
        })
        await refresh()
        alert('Importación completada')
      } catch (e) {
        alert('Archivo inválido')
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incident Manager (Local IndexedDB)</h1>
      </div>

      {mode.kind === 'list' && (
        <>
          <Toolbar onNew={() => setMode({ kind: 'create', inc: newIncident() })} onExport={exportJSON} onImport={importJSON} />
          <div className="flex flex-wrap gap-2 items-center mt-4">
            <input placeholder="Buscar..." value={query} onChange={e=>setQuery(e.target.value)} className="border rounded-xl px-3 py-2"/>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="border rounded-xl px-3 py-2">
              <option value="all">Todos</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completados</option>
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {filtered.map(inc => (
              <IncidentCard key={inc.id} inc={inc} onEdit={(i)=>setMode({ kind: 'edit', inc: i })} onDelete={onDelete} />
            ))}
            {filtered.length === 0 && (<div className="text-sm text-neutral-500">No hay incidentes. Crea uno nuevo.</div>)}
          </div>
        </>
      )}

      {mode.kind !== 'list' && (
        <div className="space-y-4">
          <button className="text-sm underline" onClick={()=>setMode({ kind:'list' })}>← Volver</button>
          <IncidentForm
            value={mode.inc}
            onChange={(v)=>setMode({ ...mode, inc: v } as Mode)}
            onSave={()=>onSave(mode.inc)}
            onCancel={()=>setMode({ kind: 'list' })}
          />
        </div>
      )}
    </main>
  )
}
